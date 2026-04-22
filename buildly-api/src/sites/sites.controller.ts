import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto, AddPageDto } from './dto/site.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateSiteDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    return this.sitesService.create(userId, dto, user);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.sitesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.sitesService.findOne(id, userId);
  }

  @Patch(':id')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateSiteDto) {
    return this.sitesService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.sitesService.remove(id, userId);
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');
    return this.sitesService.duplicate(id, userId, user);
  }

  @Post(':id/pages')
  addPage(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: AddPageDto) {
    return this.sitesService.addPage(id, userId, dto);
  }

  @Delete(':id/pages/:pageId')
  removePage(@Param('id') id: string, @Param('pageId') pageId: string, @CurrentUser('id') userId: string) {
    return this.sitesService.removePage(id, userId, pageId);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.sitesService.getVersions(id, userId);
  }

  @Post(':id/versions/save')
  saveVersion(@Param('id') id: string, @CurrentUser('id') userId: string, @Body('label') label: string) {
    return this.sitesService.saveVersion(id, userId, label ?? 'Manual save');
  }

  @Post(':id/versions/:versionId/restore')
  restoreVersion(@Param('id') id: string, @Param('versionId') versionId: string, @CurrentUser('id') userId: string) {
    return this.sitesService.restoreVersion(id, userId, versionId);
  }

  @Public()
  @Get('public/:slug')
  async findPublic(@Param('slug') slug: string) {
    const site = await this.sitesService.findPublic(slug);
    await this.sitesService.incrementViewCount(slug);
    return site;
  }

  @Public()
  @Get('domain/:hostname')
  findByDomain(@Param('hostname') hostname: string) {
    return this.sitesService.findByDomain(hostname);
  }
}
