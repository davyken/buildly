import { Controller, Get, Post, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';

@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get()
  list(@Query('category') category?: string) {
    return this.templatesService.listTemplates(category);
  }

  @Post(':id/use')
  @UseGuards(JwtAuthGuard)
  async use(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.templatesService.useTemplate(id, userId, user);
  }
}
