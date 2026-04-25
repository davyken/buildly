import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PUBLISH_QUEUE } from './processors/publish.processor';
import { Site, SiteStatus } from '../sites/schemas/site.schema';
import { Version, VersionLabel } from '../sites/schemas/version.schema';

@Injectable()
export class PublishService {
  constructor(
    @InjectQueue(PUBLISH_QUEUE) private publishQueue: Queue,
    @InjectModel(Site.name) private siteModel: Model<any>,
    @InjectModel(Version.name) private versionModel: Model<any>,
  ) {}

  async publish(siteId: string, userId: string) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');

    await this.versionModel.create({
      siteId: new Types.ObjectId(siteId), userId: new Types.ObjectId(userId),
      label: VersionLabel.PUBLISH,
      pagesSnapshot: JSON.parse(JSON.stringify(site.pages)),
      metaSnapshot: { ...site.meta }, isPublished: true,
    });

    const job = await this.publishQueue.add('publish', { siteId, userId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 50, removeOnFail: 100 });

    const rendererUrl = process.env.RENDERER_URL ?? 'http://localhost:3001';
    return { jobId: job.id, status: 'queued', message: 'Your site is being published.', previewUrl: `${rendererUrl}/s/${site.slug}` };
  }

  async unpublish(siteId: string, userId: string) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    if (site.status !== SiteStatus.PUBLISHED) return { message: 'Site is already unpublished' };
    const job = await this.publishQueue.add('unpublish', { siteId, userId });
    return { jobId: job.id, status: 'queued', message: 'Site is being taken offline.' };
  }

  async getJobStatus(jobId: string) {
    const job = await this.publishQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');
    return { jobId, state: await job.getState(), progress: job.progress(), result: job.returnvalue, failReason: job.failedReason };
  }

   async getSitePublishInfo(siteId: string, userId: string) {
     const site = await this.siteModel.findById(siteId).select('status slug publishedAt customDomain deployedUrl userId');
     if (!site) throw new NotFoundException('Site not found');
     if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
     const rendererUrl = process.env.RENDERER_URL ?? 'http://localhost:3001';
     const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
     let appHost = 'yourapp.io';
     try {
       appHost = new URL(appUrl).hostname;
     } catch {}
     return {
       status: site.status,
       isPublished: site.status === SiteStatus.PUBLISHED,
       publishedAt: site.publishedAt,
       deployedUrl: site.deployedUrl,
       publicUrl: site.status === SiteStatus.PUBLISHED ? `${rendererUrl}/s/${site.slug}` : null,
       customDomainUrl: site.customDomain ? `https://${site.customDomain}` : null,
       dnsRecord: site.status === SiteStatus.PUBLISHED ? {
         type: 'CNAME',
         host: `sites.${appHost}`,
         value: `sites.${appHost}`,
         note: 'DNS changes can take up to 24 hours to propagate.',
       } : null,
     };
   }
}
