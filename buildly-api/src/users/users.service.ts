import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserPlan } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(email: string, password: string, name?: string): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      email,
      passwordHash,
      name: name || email.split('@')[0],
      limits: {
        maxSites: 1,
        customDomains: 0,
        formSubmissionsPerMonth: 50,
      },
    });
    return user.save();
  }

  async findByEmail(email: string, withPassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+passwordHash');
    return query.exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 10) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
  }

  async updateLastActive(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
  }

  async upgradeToPro(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        plan: UserPlan.PRO,
        'limits.maxSites': -1,        // unlimited
        'limits.customDomains': -1,   // unlimited
        'limits.formSubmissionsPerMonth': 10000,
      },
      { returnDocument: 'after' },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
