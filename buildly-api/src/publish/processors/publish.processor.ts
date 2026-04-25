import { Processor, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Site, SiteStatus } from '../../sites/schemas/site.schema';

export const PUBLISH_QUEUE = 'publish-queue';

@Processor(PUBLISH_QUEUE)
export class PublishProcessor {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    @InjectModel(Site.name) private siteModel: Model<any>,
    @Inject(CACHE_MANAGER) private cache: any,
    private configService: ConfigService,
  ) {}

  @Process('publish')
  async handlePublish(job: Job<{ siteId: string; userId: string }>) {
    const { siteId, userId } = job.data;
    let site: Site | null = null;
    this.logger.log(`Publishing site ${siteId}...`);
    
    try {
      await job.progress(10);
      
      // Fetch site
      site = await this.siteModel.findById(siteId);
      if (!site) throw new Error(`Site ${siteId} not found`);
      await job.progress(20);

      // Deploy to Vercel
      await job.progress(30);
      const deployedUrl = await this.deployToVercel(site);
      await job.progress(70);

      // Update site with published status and deployment info
      await this.siteModel.findByIdAndUpdate(siteId, {
        status: SiteStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedSnapshot: JSON.stringify(site.pages),
        deployedUrl,
        deploymentProvider: deployedUrl ? 'vercel' : null,
      });
      await job.progress(80);

      // Configure custom domain if set
      if (site.customDomain) {
        await this.configureCustomDomain(siteId, site.customDomain, deployedUrl || '', userId);
      }
      await job.progress(90);

      // Invalidate caches
      const delKeys: Promise<any>[] = [
        this.cache.del(`site:${siteId}`),
        this.cache.del(`site:public:${site.slug}`),
        this.cache.del(`user:${userId}:sites`),
      ];
      if (site.customDomain) delKeys.push(this.cache.del(`domain:${site.customDomain}`));
      await Promise.all(delKeys);
      await job.progress(100);

      const rendererUrl = this.getRendererUrl();
      this.logger.log(`Site ${siteId} published → ${deployedUrl || rendererUrl}/s/${site.slug}`);
      
      return { 
        success: true, 
        slug: site.slug, 
        publishedAt: new Date(),
        deployedUrl,
        publicUrl: deployedUrl ? `${deployedUrl}/s/${site.slug}` : `${rendererUrl}/s/${site.slug}`,
        ...(deployedUrl ? {} : { deploymentWarning: 'Vercel deployment skipped, using fallback renderer' })
      };
    } catch (error) {
      this.logger.error(`Publish failed: ${(error as Error).message}`);
      
      // Fallback: mark published even if deployment fails
      if (!site) {
        site = await this.siteModel.findById(siteId);
      }
      if (site) {
        await this.siteModel.findByIdAndUpdate(siteId, {
          status: SiteStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedSnapshot: JSON.stringify(site.pages),
        });
      }
      
      const rendererUrl = this.getRendererUrl();
      return { 
        success: true, 
        slug: site ? site.slug : siteId, 
        publishedAt: new Date(),
        deployedUrl: null,
        publicUrl: `${rendererUrl}/s/${site ? site.slug : siteId}`,
        deploymentWarning: 'Vercel deployment failed, using fallback renderer'
      };
    }
  }

  @Process('unpublish')
  async handleUnpublish(job: Job<{ siteId: string; userId: string }>) {
    const { siteId, userId } = job.data;
    const site = await this.siteModel.findByIdAndUpdate(
      siteId, 
      { status: SiteStatus.DRAFT, publishedAt: null }, 
      { returnDocument: 'after' }
    );
    if (site) {
      await Promise.all([
        this.cache.del(`site:${siteId}`),
        this.cache.del(`site:public:${site.slug}`),
        this.cache.del(`user:${userId}:sites`),
      ]);
    }
    return { success: true };
  }

  private getRendererUrl(): string {
    const rendererUrl = this.configService.get<string>('RENDERER_URL');
    return rendererUrl || 'http://localhost:3001';
  }

  private getAppUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL');
    return appUrl || 'http://localhost:3000';
  }

  private async deployToVercel(site: Site): Promise<string | null> {
    const vercelToken = this.configService.get<string>('VERCEL_TOKEN');
    if (!vercelToken) {
      this.logger.warn('VERCEL_TOKEN not configured, skipping Vercel deployment');
      return null;
    }

    try {
      const { execSync } = await import('child_process');
      const { writeFileSync, mkdirSync, rmSync } = await import('fs');
      const { join } = await import('path');
      const { tmpdir } = await import('os');
      
      const projectName = `buildly-site-${site.slug}`;
      const tmpDir = join(tmpdir(), `buildly-deploy-${Date.now()}`);
      mkdirSync(tmpDir, { recursive: true });

      const files = this.generateSiteFiles(site);

      // Write files to temp directory
      for (const file of files) {
        const filePath = join(tmpDir, file.file);
        const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
        mkdirSync(fileDir, { recursive: true });
        writeFileSync(filePath, Buffer.from(file.data, 'base64'));
      }

        // Deploy using Vercel CLI
        try {
          const output = execSync(
            `npx vercel deploy --prod --yes --token=${vercelToken} --name=buildly-${site.slug}`,
            { 
              cwd: tmpDir, 
              encoding: 'utf8',
              env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' }
            }
          );
         this.logger.log(`Vercel output: ${output}`);
         // Vercel CLI outputs the URL
         const urlMatch = output.match(/https:[^\s]+\.vercel\.app/);
         const url = urlMatch ? urlMatch[0] : output.trim().split('\n').pop()?.trim();
         this.logger.log(`Vercel deployment created: ${url}`);
         return url || null;
        } catch (error: any) {
          this.logger.error(`Vercel CLI deployment failed: ${error.message}`);
          this.logger.error(`stdout: ${error.stdout}`);
          this.logger.error(`stderr: ${error.stderr}`);
          return null;
        }
    } catch (error) {
      this.logger.error(`Vercel deployment failed: ${(error as Error).message}`);
      return null;
    }
  }


  private generateSiteFiles(site: Site): any[] {
    const files: any[] = [];
    const rendererUrl = this.getRendererUrl();
    const siteName = (site.meta?.title || site.name || 'Site').replace(/</g, '&lt;');

    // Main index.html - iframe that embeds the renderer
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <meta name="description" content="${(site.meta?.description || '').replace(/</g, '&lt;')}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; }
    #frame { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe id="frame" src="${rendererUrl}/s/${site.slug}" title="${siteName}"></iframe>
</body>
</html>`;

    files.push({
      file: 'index.html',
      data: Buffer.from(indexHtml).toString('base64'),
    });

    // Page-specific HTML files for direct URL access
    for (const page of site.pages) {
      if (page.path === '/') continue;
      
      const pageName = (page.meta?.title || page.name || siteName).replace(/</g, '&lt;');
      const pathDir = page.path.replace(/^\//, '');
      const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName}</title>
  <meta name="description" content="${(site.meta?.description || '').replace(/</g, '&lt;')}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; }
    #frame { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe id="frame" src="${rendererUrl}/s/${site.slug}?page=${encodeURIComponent(page.path)}" title="${pageName}"></iframe>
</body>
</html>`;

      files.push({
        file: `${pathDir}/index.html`,
        data: Buffer.from(pageHtml).toString('base64'),
      });
    }

     // vercel.json configuration
     const vercelConfig = {
       framework: null,
       rewrites: [
         { source: '/(.*)', destination: '/index.html' }
       ],
       headers: [
         {
           source: '/(.*)',
           headers: [
             { key: 'X-Frame-Options', value: 'ALLOWALL' }
           ]
         }
       ]
     };

    files.push({
      file: 'vercel.json',
      data: Buffer.from(JSON.stringify(vercelConfig, null, 2)).toString('base64'),
    });

    this.logger.log(`Generated ${files.length} files for Vercel deployment of ${site.slug}`);
    return files;
  }

  private async configureCustomDomain(
    siteId: string,
    domain: string,
    deployedUrl: string,
    userId: string
  ): Promise<void> {
    const vercelToken = this.configService.get<string>('VERCEL_TOKEN');
    if (!vercelToken || !deployedUrl) {
      this.logger.warn('Missing Vercel token or deployed URL, skipping domain configuration');
      return;
    }

     try {
       const { execSync } = await import('child_process');
       
        // Add domain to Vercel deployment using CLI
        execSync(
          `npx vercel domains add ${domain} --token=${vercelToken} 2>&1`,
          { 
            encoding: 'utf-8', 
            stdio: 'pipe',
            env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' }
          }
        );

      this.logger.log(`Domain ${domain} added to Vercel deployment`);

      await this.siteModel.findByIdAndUpdate(siteId, {
        'domainConfig.domainStatus': 'pending',
        'domainConfig.verifiedAt': null,
      });
      
      await this.cache.del(`domain:${domain}`);
    } catch (error) {
      this.logger.error(`Failed to configure domain ${domain}: ${(error as Error).message}`);
    }
  }
}
