import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DomainsService } from './domains.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { IsString, IsUrl } from 'class-validator';

class ConnectDomainDto {
  @IsString()
  domain: string;
}

@Controller()
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // Connect a custom domain to a site
  @Post('sites/:siteId/domain')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  connect(
    @Param('siteId') siteId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ConnectDomainDto,
  ) {
    return this.domainsService.connectDomain(siteId, userId, dto.domain);
  }

  // Check DNS propagation
  @Get('sites/:siteId/domain/verify')
  @UseGuards(JwtAuthGuard)
  verify(
    @Param('siteId') siteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainsService.verifyDomain(siteId, userId);
  }

  // Get domain status
  @Get('sites/:siteId/domain')
  @UseGuards(JwtAuthGuard)
  getStatus(
    @Param('siteId') siteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainsService.getDomainStatus(siteId, userId);
  }

  // Disconnect domain
  @Delete('sites/:siteId/domain')
  @UseGuards(JwtAuthGuard)
  disconnect(
    @Param('siteId') siteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.domainsService.disconnectDomain(siteId, userId);
  }

  // Called by Caddy to verify if domain should get SSL cert (public)
  @Public()
  @Get('domains/tls-verify')
  verifyForTls(@Query('domain') domain: string) {
    return this.domainsService.verifyForTls(domain).then((ok) => {
      if (!ok) throw new Error('Domain not authorized');
      return { authorized: true };
    });
  }
}
