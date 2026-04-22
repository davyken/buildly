import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, ConflictException, Logger, Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dns from 'dns';
import { promisify } from 'util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { Site, SiteDocument, SiteStatus } from '../sites/schemas/site.schema';

const resolveCname = promisify(dns.resolveCname);

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);
  private readonly appHost: string;

  constructor(
    @InjectModel(Site.name) private siteModel: Model<SiteDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private configService: ConfigService,
  ) {
    const appUrl = this.configService.get<string>('appUrl') ?? 'http://localhost:3000';
    try { this.appHost = new URL(appUrl).hostname; } catch { this.appHost = 'yourapp.io'; }
  }

  async connectDomain(siteId: string, userId: string, domain: string) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    if (site.status !== SiteStatus.PUBLISHED)
      throw new BadRequestException('Publish your site before connecting a domain');

    const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const existing = await this.siteModel.findOne({ customDomain: clean, _id: { $ne: siteId } });
    if (existing) throw new ConflictException('Domain already connected to another site');

    await this.siteModel.findByIdAndUpdate(siteId, {
      customDomain: clean,
      domainConfig: { domainStatus: 'pending', verifiedAt: null },
    });
    await this.cache.del(`site:${siteId}`);
    await this.cache.del(`user:${userId}:sites`);

    return {
      domain: clean, status: 'pending',
      instructions: {
        type: 'CNAME', host: clean,
        value: `sites.${this.appHost}`,
        note: 'DNS changes can take up to 24 hours to propagate.',
      },
    };
  }

  async verifyDomain(siteId: string, userId: string) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    if (!site.customDomain) throw new BadRequestException('No custom domain connected');

    const expectedCname = `sites.${this.appHost}`;
    try {
      const cnames = await resolveCname(site.customDomain);
      const verified = cnames.some((c) => c === expectedCname || c.endsWith(`.${this.appHost}`));
      if (verified) {
        await this.siteModel.findByIdAndUpdate(siteId, {
          'domainConfig.domainStatus': 'active', 'domainConfig.verifiedAt': new Date(),
        });
        await this.cache.del(`domain:${site.customDomain}`);
        await this.cache.del(`site:${siteId}`);
        return { verified: true, status: 'active', domain: site.customDomain };
      }
      return { verified: false, status: 'pending', domain: site.customDomain, found: cnames, expected: expectedCname };
    } catch (err) {
      return { verified: false, status: 'failed', domain: site.customDomain, message: 'DNS lookup failed. Check CNAME record.' };
    }
  }

  async verifyForTls(domain: string): Promise<boolean> {
    const site = await this.siteModel.findOne({
      customDomain: domain, status: SiteStatus.PUBLISHED, 'domainConfig.domainStatus': 'active',
    });
    return !!site;
  }

  async disconnectDomain(siteId: string, userId: string) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    const oldDomain = site.customDomain;
    await this.siteModel.findByIdAndUpdate(siteId, { customDomain: null, domainConfig: null });
    if (oldDomain) await this.cache.del(`domain:${oldDomain}`);
    await this.cache.del(`site:${siteId}`);
    await this.cache.del(`user:${userId}:sites`);
    return { message: 'Domain disconnected successfully' };
  }

  async getDomainStatus(siteId: string, userId: string) {
    const site = await this.siteModel.findById(siteId).select('customDomain domainConfig userId');
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    return {
      domain: site.customDomain,
      status: site.domainConfig?.domainStatus ?? null,
      verifiedAt: site.domainConfig?.verifiedAt ?? null,
    };
  }
}
