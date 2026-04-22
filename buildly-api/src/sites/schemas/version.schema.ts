import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VersionDocument = Version & Document;

export enum VersionLabel {
  PUBLISH = 'Published',
  AUTO = 'Auto-save',
  MANUAL = 'Manual save',
  RESTORE = 'Restored',
}

@Schema({ timestamps: true })
export class Version {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  label: string;

  @Prop({ type: Array, required: true })
  pagesSnapshot: any[];

  @Prop({ type: Object })
  metaSnapshot: any;

  @Prop({ default: false })
  isPublished: boolean;
}

export const VersionSchema = SchemaFactory.createForClass(Version);

VersionSchema.index({ siteId: 1, createdAt: -1 });
