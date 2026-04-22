import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Module,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 uploads/min
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif|svg\+xml)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetsService.uploadImage(file, userId);
  }

  @Get()
  listImages(@CurrentUser('id') userId: string) {
    return this.assetsService.listUserImages(userId);
  }

  @Delete('*publicId')
  deleteImage(
    @Param('publicId') publicId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetsService.deleteImage(publicId, userId);
  }
}
