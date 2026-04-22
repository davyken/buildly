import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PublishService } from './publish.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Post('sites/:id/publish')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.publishService.publish(id, userId);
  }

  @Post('sites/:id/unpublish')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  unpublish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.publishService.unpublish(id, userId);
  }

  @Get('sites/:id/publish-info')
  getPublishInfo(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.publishService.getSitePublishInfo(id, userId);
  }

  @Get('publish/jobs/:jobId')
  getJobStatus(@Param('jobId') jobId: string) {
    return this.publishService.getJobStatus(jobId);
  }
}
