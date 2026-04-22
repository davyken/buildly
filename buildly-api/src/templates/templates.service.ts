import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Site, SiteDocument } from '../sites/schemas/site.schema';
import { UserDocument, UserPlan } from '../users/schemas/user.schema';
import { DEFAULT_TEMPLATES } from './data/templates.data';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Site.name) private siteModel: Model<SiteDocument>,
  ) {}

  // List all available templates (built-in + community)
  async listTemplates(category?: string) {
    const builtIn = category
      ? DEFAULT_TEMPLATES.filter((t) => t.category === category)
      : DEFAULT_TEMPLATES;

    // Also fetch any community templates saved in DB
    const dbTemplates = await this.siteModel
      .find({ isTemplate: true })
      .select('name meta pages slug')
      .lean()
      .exec();

    return {
      templates: builtIn,
      communityTemplates: dbTemplates,
    };
  }

  // Clone a template into a new site for the user
  async useTemplate(
    templateId: string,
    userId: string,
    user: UserDocument,
  ): Promise<SiteDocument> {
    // Check plan limits
    const siteCount = await this.siteModel.countDocuments({ userId, isTemplate: false });
    if (user.plan === UserPlan.FREE && siteCount >= user.limits.maxSites) {
      throw new ForbiddenException(
        'Free plan is limited to 1 site. Upgrade to Pro to use more templates.',
      );
    }

    // Find built-in template
    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      // Try DB template
      const dbTemplate = await this.siteModel.findOne({ _id: templateId, isTemplate: true });
      if (!dbTemplate) throw new NotFoundException('Template not found');
      return this.cloneFromDbTemplate(dbTemplate, userId);
    }

    return this.cloneFromBuiltIn(template, userId);
  }

  // ── Private helpers ───────────────────────────────────────────────────────────
  private async cloneFromBuiltIn(template: any, userId: string): Promise<SiteDocument> {
    const slug = await this.generateUniqueSlug(template.name);

    // Deep clone pages and regenerate all element IDs to avoid collisions
    const pages = JSON.parse(JSON.stringify(template.pages)).map((page: any) => ({
      ...page,
      id: uuidv4(),
      elements: page.elements.map((el: any) => ({ ...el, id: uuidv4() })),
    }));

    const site = new this.siteModel({
      userId: new Types.ObjectId(userId),
      name: template.name,
      slug,
      pages,
      meta: { ...template.meta },
      globalBackground: '#ffffff',
    });

    return site.save();
  }

  private async cloneFromDbTemplate(
    template: SiteDocument,
    userId: string,
  ): Promise<SiteDocument> {
    const slug = await this.generateUniqueSlug(template.name);

    const pages = JSON.parse(JSON.stringify(template.pages)).map((page: any) => ({
      ...page,
      id: uuidv4(),
      elements: page.elements.map((el: any) => ({ ...el, id: uuidv4() })),
    }));

    const site = new this.siteModel({
      userId: new Types.ObjectId(userId),
      name: template.name,
      slug,
      pages,
      meta: { ...template.meta },
    });

    return site.save();
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    let slug = base;
    let attempt = 0;
    while (await this.siteModel.exists({ slug })) {
      slug = `${base}-${uuidv4().substring(0, 6)}`;
      if (++attempt > 10) break;
    }
    return slug;
  }
}
