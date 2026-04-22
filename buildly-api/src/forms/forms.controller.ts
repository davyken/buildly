import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Ip,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // ── Public: visitor submits a form ────────────────────────────────────────────
  @Public()
  @Post('forms/submit/:siteSlug/:formId')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 submissions/min per IP
  submit(
    @Param('siteSlug') siteSlug: string,
    @Param('formId') formId: string,
    @Body() body: { pageId: string; fields: Record<string, string> },
    @Ip() ip: string,
  ) {
    return this.formsService.submit(
      siteSlug,
      formId,
      body.pageId,
      body.fields,
      ip,
    );
  }

  // ── Auth: site owner views submissions ────────────────────────────────────────
  @Get('sites/:siteId/submissions')
  @UseGuards(JwtAuthGuard)
  getSubmissions(
    @Param('siteId') siteId: string,
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.formsService.getSubmissions(siteId, userId, page, limit);
  }

  @Patch('submissions/:id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.formsService.markRead(id, userId);
  }

  @Delete('submissions/:id')
  @UseGuards(JwtAuthGuard)
  deleteSubmission(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.formsService.deleteSubmission(id, userId);
  }
}
