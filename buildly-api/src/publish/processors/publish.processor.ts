import { Processor, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Site, SiteStatus } from '../../sites/schemas/site.schema';
import * as crypto from 'crypto';

declare const require: any;
const Vercel = require('vercel');

export const PUBLISH_QUEUE = 'publish-queue';

@Processor(PUBLISH_QUEUE)
export class PublishProcessor {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    @InjectModel(Site.name) private siteModel: Model<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(CACHE_MANAGER) private cache: any,
    private configService: ConfigService,
  ) {}

  @Process('publish')
  async handlePublish(job: Job<{ siteId: string; userId: string }>) {
    const { siteId, userId } = job.data;
    const configService = this.configService || new ConfigService();
    this.logger.log(`Publishing site ${siteId}...`);
    try {
      await job.progress(10);
      const site = await this.siteModel.findById(siteId);
      if (!site) throw new Error(`Site ${siteId} not found`);
      await job.progress(20);

      // Generate static files for deployment
      await job.progress(30);
      const deployedUrl = await this.deployToVercel(site);
      await job.progress(70);

      // Update site with published status and deployment info
      await this.siteModel.findByIdAndUpdate(siteId, {
        status: SiteStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedSnapshot: JSON.stringify(site.pages),
        deployedUrl,
        deploymentProvider: 'vercel',
      });
      await job.progress(80);

      // Configure custom domain if set
      if (site.customDomain) {
        await this.configureCustomDomain(siteId, site.customDomain, deployedUrl, userId);
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

      this.logger.log(`Site ${siteId} published → ${deployedUrl}`);
      return { 
        success: true, 
        slug: site.slug, 
        publishedAt: new Date(),
        deployedUrl,
        publicUrl: deployedUrl ? `${deployedUrl}/s/${site.slug}` : `${this.getRendererUrl()}/s/${site.slug}`
      };
    } catch (error) {
      this.logger.error(`Publish failed: ${(error as Error).message}`);
      // Continue with fallback: mark published even if deployment fails
      await this.siteModel.findByIdAndUpdate(siteId, {
        status: SiteStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedSnapshot: JSON.stringify(site.pages),
      });
      const rendererUrl = this.getRendererUrl();
      return { 
        success: true, 
        slug: site.slug, 
        publishedAt: new Date(),
        deployedUrl: null,
        publicUrl: `${rendererUrl}/s/${site.slug}`,
        deploymentWarning: 'Vercel deployment failed, using fallback renderer'
      };
    }
  }

  @Process('unpublish')
  async handleUnpublish(job: Job<{ siteId: string; userId: string }>) {
    const { siteId, userId } = job.data;
    const site = await this.siteModel.findByIdAndUpdate(
      siteId, { status: SiteStatus.DRAFT, publishedAt: null }, { returnDocument: 'after' },
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
}
