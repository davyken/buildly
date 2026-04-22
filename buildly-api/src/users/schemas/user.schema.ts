import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & { id: string };

export enum UserPlan { FREE = 'free', PRO = 'pro' }

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true, select: false }) passwordHash: string;
  @Prop({ trim: true }) name: string;
  @Prop({ enum: UserPlan, default: UserPlan.FREE }) plan: UserPlan;
  @Prop({ default: null }) refreshToken: string;
  @Prop({
    type: { maxSites: { type: Number, default: 1 }, customDomains: { type: Number, default: 0 }, formSubmissionsPerMonth: { type: Number, default: 50 } },
    default: {},
  })
  limits: { maxSites: number; customDomains: number; formSubmissionsPerMonth: number };
  @Prop({ default: null }) lastActiveAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
