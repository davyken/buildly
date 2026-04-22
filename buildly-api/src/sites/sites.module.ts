import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site, SiteSchema } from './schemas/site.schema';
import { Version, VersionSchema } from './schemas/version.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Version.name, schema: VersionSchema },
    ]),
    UsersModule,
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
