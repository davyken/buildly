import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId: Types.ObjectId;

  @Prop({ required: true })
  formId: string;

  @Prop({ required: true })
  pageId: string;

  @Prop()
  visitorIp: string;

  @Prop({ type: Object, required: true })
  fields: Record<string, string>;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: false })
  emailSent: boolean;

  @Prop({ default: null })
  emailError: string;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);

FormSubmissionSchema.index({ siteId: 1, createdAt: -1 });
FormSubmissionSchema.index({ siteId: 1, read: 1 });
