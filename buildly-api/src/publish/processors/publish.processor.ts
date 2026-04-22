import { Processor, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Site, SiteStatus } from '../../sites/schemas/site.schema';

export const PUBLISH_QUEUE = 'publish-queue';

@Processor(PUBLISH_QUEUE)
export class PublishProcessor {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    @InjectModel(Site.name) private siteModel: Model<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(CACHE_MANAGER) private cache: any,
  ) {}

  @Process('publish')
  async handlePublish(job: Job<{ siteId: string; userId: string }>) {
    const { siteId, userId } = job.data;
    this.logger.log(`Publishing site ${siteId}...`);
    try {
      await job.progress(10);
      const site = await this.siteModel.findById(siteId);
      if (!site) throw new Error(`Site ${siteId} not found`);
      await job.progress(40);
      await this.siteModel.findByIdAndUpdate(siteId, {
        status: SiteStatus.PUBLISHED, publishedAt: new Date(),
        publishedSnapshot: JSON.stringify(site.pages),
      });
      await job.progress(80);
      const delKeys: Promise<any>[] = [
        this.cache.del(`site:${siteId}`),
        this.cache.del(`site:public:${site.slug}`),
        this.cache.del(`user:${userId}:sites`),
      ];
      if (site.customDomain) delKeys.push(this.cache.del(`domain:${site.customDomain}`));
      await Promise.all(delKeys);
      await job.progress(100);
      this.logger.log(`Site ${siteId} published → /${site.slug}`);
      return { success: true, slug: site.slug, publishedAt: new Date() };
    } catch (error) {
      this.logger.error(`Publish failed: ${(error as Error).message}`);
      throw error;
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
