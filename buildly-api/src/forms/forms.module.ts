import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormSubmission, FormSubmissionSchema } from './schemas/submission.schema';
import { Site, SiteSchema } from '../sites/schemas/site.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}
