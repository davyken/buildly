import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { Site, SiteSchema } from '../sites/schemas/site.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
  ],
  controllers: [DomainsController],
  providers: [DomainsService],
})
export class DomainsModule {}
