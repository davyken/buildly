import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SiteDocument = Site & Document;

export enum SiteStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// ── Element ────────────────────────────────────────────────────────────────────
export class ElementLink {
  type: 'internal' | 'external' | 'whatsapp' | 'email';
  value: string; // pageId | URL | phone | email
  openInNewTab?: boolean;
}

export class FormField {
  id: string;
  label: string;
  inputType: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select
}

export class FormConfig {
  fields: FormField[];
  submitLabel: string;
  recipientEmail: string;
  successMessage: string;
  enableEmailConfirmation: boolean;
}

export class WhatsAppConfig {
  phone: string;
  prefilledMessage?: string;
  floating: boolean; // fixed bottom-right bubble
}

export class SiteElement {
  id: string;
  type: string; // heading | text | image | button | box | divider | form | whatsapp-button | navbar | video
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content?: string;
  styles: Record<string, any>;
  link?: ElementLink;
  formConfig?: FormConfig;
  whatsappConfig?: WhatsAppConfig;
  visible: boolean;
  locked: boolean; // prevent accidental edits
}

// ── Page ───────────────────────────────────────────────────────────────────────
export class SitePage {
  id: string;
  name: string;
  path: string; // "/", "/about", "/contact"
  background: string;
  elements: SiteElement[];
  meta: {
    title?: string;
    description?: string;
  };
}

// ── Meta ───────────────────────────────────────────────────────────────────────
export class SiteMeta {
  title: string;
  description?: string;
  favicon?: string;
  language: string;
}

// ── Site ───────────────────────────────────────────────────────────────────────
@Schema({ timestamps: true })
export class Site {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ enum: SiteStatus, default: SiteStatus.DRAFT, index: true })
  status: SiteStatus;

  @Prop({ default: null, sparse: true, lowercase: true })
  customDomain: string;

  @Prop({
    type: {
      domainStatus: { type: String, enum: ['pending', 'active', 'failed'], default: 'pending' },
      verifiedAt: { type: Date, default: null },
    },
    default: null,
  })
  domainConfig: {
    domainStatus: 'pending' | 'active' | 'failed';
    verifiedAt: Date | null;
  };

  @Prop({ type: Object, default: { title: 'My Site', language: 'en' } })
  meta: SiteMeta;

  @Prop({ type: Array, default: [] })
  pages: SitePage[];

  @Prop({ default: null })
  publishedAt: Date;

  @Prop({ default: null })
  publishedSnapshot: string; // JSON string of pages at publish time (kept lean)

  @Prop({ default: '#ffffff' })
  globalBackground: string;

  @Prop({ default: false })
  isTemplate: boolean;

  @Prop({ default: 0 })
  viewCount: number;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

// Indexes
SiteSchema.index({ userId: 1, updatedAt: -1 });
SiteSchema.index({ status: 1, userId: 1 });
