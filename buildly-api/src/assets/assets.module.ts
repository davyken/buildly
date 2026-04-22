import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
