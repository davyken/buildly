import {
  Injectable, BadRequestException, NotFoundException,
  ForbiddenException, Logger, Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FormSubmission, FormSubmissionDocument } from './schemas/submission.schema';
import { Site, SiteDocument } from '../sites/schemas/site.schema';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);
  private resend: Resend | null = null;
  private emailFrom: string;

  constructor(
    @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
    @InjectModel(Site.name) private siteModel: Model<SiteDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    if (apiKey) this.resend = new Resend(apiKey);
    this.emailFrom = this.configService.get<string>('resend.from') ?? 'noreply@yourapp.io';
  }

  async submit(siteSlug: string, formId: string, pageId: string, fields: Record<string, string>, visitorIp: string) {
    // Spam: max 3 per IP per form per hour
    const spamKey = `form:spam:${visitorIp}:${formId}`;
    const spamCount = (await this.cache.get<number>(spamKey)) ?? 0;
    if (spamCount >= 3) throw new BadRequestException('Too many submissions. Try again later.');

    // Honeypot
    if (fields['_hp'] && fields['_hp'].trim() !== '') return { success: true, message: 'Sent!' };
    const cleanFields = { ...fields };
    delete cleanFields['_hp'];

    const site = await this.siteModel.findOne({ slug: siteSlug });
    if (!site) throw new NotFoundException('Site not found');

    let formConfig: any = null;
    let recipientEmail = '';
    outer: for (const page of site.pages) {
      for (const el of page.elements) {
        if (el.type === 'form' && el.id === formId && el.formConfig) {
          formConfig = el.formConfig;
          recipientEmail = el.formConfig.recipientEmail ?? '';
          break outer;
        }
      }
    }
    if (!formConfig) throw new NotFoundException('Form not found');

    // Validate required fields
    for (const field of formConfig.fields) {
      if (field.required && (!cleanFields[field.id] || cleanFields[field.id].trim() === '')) {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    const submission = await this.submissionModel.create({
      siteId: site._id, formId, pageId, visitorIp, fields: cleanFields,
    });

    await this.cache.set(spamKey, spamCount + 1, 3600000);

    // Send emails in background — don't block response
    this.sendEmails(String(submission._id), recipientEmail, formConfig, cleanFields, site.name).catch(
      (err) => this.logger.error(`Email failed for submission ${submission._id}: ${(err as Error).message}`),
    );

    return { success: true, message: formConfig.successMessage ?? 'Message sent!' };
  }

  async getSubmissions(siteId: string, userId: string, page = 1, limit = 20) {
    const site = await this.siteModel.findById(siteId);
    if (!site) throw new NotFoundException('Site not found');
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');

    const skip = (page - 1) * limit;
    const [submissions, total, unreadCount] = await Promise.all([
      this.submissionModel.find({ siteId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.submissionModel.countDocuments({ siteId }),
      this.submissionModel.countDocuments({ siteId, read: false }),
    ]);

    return { submissions, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, unreadCount };
  }

  async markRead(submissionId: string, userId: string) {
    const submission = await this.submissionModel.findById(submissionId).populate('siteId');
    if (!submission) throw new NotFoundException('Submission not found');
    const site = submission.siteId as any;
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    submission.read = true;
    return submission.save();
  }

  async deleteSubmission(submissionId: string, userId: string) {
    const submission = await this.submissionModel.findById(submissionId).populate('siteId');
    if (!submission) throw new NotFoundException('Submission not found');
    const site = submission.siteId as any;
    if (String(site.userId) !== userId) throw new ForbiddenException('Access denied');
    await this.submissionModel.findByIdAndDelete(submissionId);
    return { message: 'Submission deleted' };
  }

  private async sendEmails(
    submissionId: string, recipientEmail: string, formConfig: any,
    fields: Record<string, string>, siteName: string,
  ) {
    if (!this.resend) { this.logger.warn('Resend not configured — skipping email'); return; }

    const fieldRows = Object.entries(fields)
      .map(([key, value]) => {
        const label = (formConfig.fields as any[]).find((f) => f.id === key)?.label ?? key;
        return `<tr><td style="padding:8px 12px;font-weight:600;background:#f8f9fa;">${label}</td><td style="padding:8px 12px;">${value}</td></tr>`;
      }).join('');

    await this.resend.emails.send({
      from: this.emailFrom,
      to: recipientEmail,
      subject: `New message from ${siteName}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#6366f1;">New Form Submission — ${siteName}</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${fieldRows}</table>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px;">Received ${new Date().toLocaleString()} • ID: ${submissionId}</p>
      </div>`,
    });

    if (formConfig.enableEmailConfirmation && fields['email']) {
      await this.resend.emails.send({
        from: this.emailFrom,
        to: fields['email'],
        subject: `We received your message — ${siteName}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6366f1;">Message Received</h2>
          <p>Hi ${fields['name'] ?? 'there'}, thanks for reaching out to <strong>${siteName}</strong>. We'll get back to you shortly.</p>
        </div>`,
      });
    }

    await this.submissionModel.findByIdAndUpdate(submissionId, { emailSent: true });
  }
}
