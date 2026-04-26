import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, BadRequestException, Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { Site, SiteDocument, SiteStatus } from './schemas/site.schema';
import { Version, VersionDocument, VersionLabel } from './schemas/version.schema';
import { CreateSiteDto, UpdateSiteDto, AddPageDto } from './dto/site.dto';
import { UserDocument, UserPlan } from '../users/schemas/user.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private siteModel: Model<SiteDocument>,
    @InjectModel(Version.name) private versionModel: Model<VersionDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(userId: string, dto: CreateSiteDto, user: UserDocument): Promise<SiteDocument> {
    const siteCount = await this.siteModel.countDocuments({ userId });
    if (user.plan === UserPlan.FREE && siteCount >= user.limits.maxSites) {
      throw new ForbiddenException('Free plan is limited to 1 site. Upgrade to Pro for unlimited sites.');
    }
    const slug = await this.generateUniqueSlug(dto.name);
    const site = new this.siteModel({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      slug,
      pages: [{ id: uuidv4(), name: 'Home', path: '/', background: '#ffffff', elements: [], meta: { title: dto.name } }],
      meta: { title: dto.name, language: 'en' },
    });
    return site.save();
  }

  async findAll(userId: string): Promise<SiteDocument[]> {
    const cacheKey = `user:${userId}:sites`;
    const cached = await this.cache.get<SiteDocument[]>(cacheKey);
    if (cached && cached.length > 0) return cached;
    const sites = await this.siteModel
      .find({ userId: new Types.ObjectId(userId), isTemplate: false })
      .select('-pages -publishedSnapshot')
      .sort({ updatedAt: -1 }).lean().exec();
    await this.cache.set(cacheKey, sites, 60000);
    return sites as SiteDocument[];
  }

  async findOne(siteId: string, userId: string): Promise<SiteDocument> {
    const cacheKey = `site:${siteId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached && String(cached.userId) === userId) return cached as SiteDocument;
    const site = await this.siteModel.findById(siteId).exec();
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    await this.cache.set(cacheKey, site, 300000);
    return site;
  }

   async findPublic(slug: string): Promise<SiteDocument> {
     const cacheKey = `site:public:${slug}`;
     const cached = await this.cache.get<SiteDocument>(cacheKey);
     if (cached) return cached;
     const site = await this.siteModel.findOne({ slug, status: SiteStatus.PUBLISHED }).select('slug status publishedAt customDomain deployedUrl deploymentProvider pages meta name').exec();
     if (!site) throw new NotFoundException('Site not found or not published');
     await this.cache.set(cacheKey, site, 120000);
     return site;
   }

  async findByDomain(domain: string): Promise<SiteDocument | null> {
    const cacheKey = `domain:${domain}`;
    const cached = await this.cache.get<SiteDocument>(cacheKey);
    if (cached) return cached;
    const site = await this.siteModel.findOne({ customDomain: domain.toLowerCase(), status: SiteStatus.PUBLISHED }).exec();
    if (site) await this.cache.set(cacheKey, site, 600000);
    return site;
  }

  async update(siteId: string, userId: string, dto: UpdateSiteDto): Promise<SiteDocument> {
    const existing = await this.siteModel.findOne({ _id: siteId, userId: new Types.ObjectId(userId) }).exec();
    if (!existing) throw new NotFoundException('Site not found');
    const updates: any = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.pages !== undefined) updates.pages = dto.pages;
    if (dto.meta !== undefined) updates.meta = { ...existing.meta, ...dto.meta };
    if (dto.globalBackground !== undefined) updates.globalBackground = dto.globalBackground;
    const site = await this.siteModel.findByIdAndUpdate(siteId, { $set: updates }, { returnDocument: 'after' }).exec();
    await this.invalidateSiteCache(siteId, site!.slug, userId);
    return site!;
  }

  async remove(siteId: string, userId: string): Promise<void> {
    const site = await this.findOne(siteId, userId);
    await this.siteModel.findByIdAndDelete(siteId);
    await this.versionModel.deleteMany({ siteId });
    await this.invalidateSiteCache(siteId, site.slug, userId);
  }

  async duplicate(siteId: string, userId: string, user: UserDocument): Promise<SiteDocument> {
    const original = await this.findOne(siteId, userId);
    const siteCount = await this.siteModel.countDocuments({ userId });
    if (user.plan === UserPlan.FREE && siteCount >= user.limits.maxSites)
      throw new ForbiddenException('Upgrade to Pro to duplicate sites.');
    const slug = await this.generateUniqueSlug(`${original.name} Copy`);
    const newSite = new this.siteModel({
      userId: new Types.ObjectId(userId),
      name: `${original.name} (Copy)`,
      slug,
      pages: JSON.parse(JSON.stringify(original.pages)),
      meta: { ...original.meta },
      globalBackground: original.globalBackground,
    });
    return newSite.save();
  }

  async addPage(siteId: string, userId: string, dto: AddPageDto): Promise<SiteDocument> {
    const site = await this.findOne(siteId, userId);
    if (site.pages.some((p) => p.path === dto.path))
      throw new ConflictException(`A page with path "${dto.path}" already exists`);
    const newPage = { id: uuidv4(), name: dto.name, path: dto.path, background: '#ffffff', elements: [], meta: { title: dto.name } };
    const updated = await this.siteModel.findByIdAndUpdate(
      siteId,
      { $push: { pages: newPage } },
      { returnDocument: 'after' },
    ).exec();
    await this.invalidateSiteCache(siteId, site.slug, userId);
    return updated!;
  }

  async removePage(siteId: string, userId: string, pageId: string): Promise<SiteDocument> {
    const site = await this.findOne(siteId, userId);
    if (site.pages.length <= 1) throw new BadRequestException('Cannot delete the last page');
    const updated = await this.siteModel.findByIdAndUpdate(
      siteId,
      { $pull: { pages: { id: pageId } } },
      { returnDocument: 'after' },
    ).exec();
    await this.invalidateSiteCache(siteId, site.slug, userId);
    return updated!;
  }

  async saveVersion(siteId: string, userId: string, label: string): Promise<VersionDocument> {
    const site = await this.findOne(siteId, userId);
    const count = await this.versionModel.countDocuments({ siteId });
    if (count >= 20) {
      const oldest = await this.versionModel.find({ siteId }).sort({ createdAt: 1 }).limit(1);
      if (oldest.length) await this.versionModel.findByIdAndDelete(oldest[0].id);
    }
    const version = new this.versionModel({
      siteId: new Types.ObjectId(siteId),
      userId: new Types.ObjectId(userId),
      label,
      pagesSnapshot: JSON.parse(JSON.stringify(site.pages)),
      metaSnapshot: { ...site.meta },
    });
    return version.save();
  }

  async getVersions(siteId: string, userId: string) {
    await this.findOne(siteId, userId);
    return this.versionModel.find({ siteId }).select('-pagesSnapshot -metaSnapshot').sort({ createdAt: -1 }).lean().exec();
  }

  async restoreVersion(siteId: string, userId: string, versionId: string): Promise<SiteDocument> {
    await this.findOne(siteId, userId);
    const version = await this.versionModel.findById(versionId);
    if (!version || String(version.siteId) !== siteId) throw new NotFoundException('Version not found');
    const site = await this.siteModel.findByIdAndUpdate(
      siteId, { pages: version.pagesSnapshot, meta: version.metaSnapshot }, { returnDocument: 'after' },
    );
    if (!site) throw new NotFoundException('Site not found');
    await this.saveVersion(siteId, userId, `${VersionLabel.RESTORE} from "${version.label}"`);
    await this.invalidateSiteCache(siteId, site.slug, userId);
    return site;
  }

  async incrementViewCount(slug: string): Promise<void> {
    await this.siteModel.updateOne({ slug }, { $inc: { viewCount: 1 } });
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
    let slug = base;
    let attempt = 0;
    while (await this.siteModel.exists({ slug })) {
      slug = `${base}-${uuidv4().substring(0, 6)}`;
      if (++attempt > 10) throw new ConflictException('Could not generate unique slug');
    }
    return slug;
  }

  private async invalidateSiteCache(siteId: string, slug: string, userId: string): Promise<void> {
    await Promise.all([
      this.cache.del(`site:${siteId}`),
      this.cache.del(`site:public:${slug}`),
      this.cache.del(`user:${userId}:sites`),
    ]);
  }
}
