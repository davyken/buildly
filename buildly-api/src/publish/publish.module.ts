import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';
import { PublishProcessor, PUBLISH_QUEUE } from './processors/publish.processor';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import { Version, VersionSchema } from '../sites/schemas/version.schema';

@Module({
  imports: [
    BullModule.registerQueue({ name: PUBLISH_QUEUE }),
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Version.name, schema: VersionSchema },
    ]),
  ],
  controllers: [PublishController],
  providers: [PublishService, PublishProcessor],
})
export class PublishModule {}
