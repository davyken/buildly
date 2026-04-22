import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);
  private readonly configured: boolean;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
    } else {
      this.logger.warn('Cloudinary not configured — asset uploads will fail');
      this.configured = false;
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; publicId: string; width: number; height: number }> {
    if (!this.configured) {
      throw new InternalServerErrorException('Asset storage not configured');
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed: JPG, PNG, WebP, GIF, SVG`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `buildly/${userId}`,
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteImage(publicId: string, userId: string): Promise<void> {
    if (!this.configured) return;

    // Security: only allow deleting from user's folder
    if (!publicId.startsWith(`buildly/${userId}/`)) {
      throw new BadRequestException('Cannot delete this asset');
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(`Cloudinary delete failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }

  async listUserImages(userId: string) {
    if (!this.configured) return { images: [] };

    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `buildly/${userId}/`,
        max_results: 100,
      });

      return {
        images: result.resources.map((r: any) => ({
          url: r.secure_url,
          publicId: r.public_id,
          width: r.width,
          height: r.height,
          bytes: r.bytes,
          createdAt: r.created_at,
        })),
      };
    } catch (error) {
      this.logger.error(`Cloudinary list failed: ${error.message}`);
      return { images: [] };
    }
  }
}
