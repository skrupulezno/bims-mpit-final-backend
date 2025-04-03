import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  @Roles('ADMIN')
  async createService(@Body('name') name: string, @Body('organizationId') organizationId: number) {
    return this.serviceService.create(name, organizationId);
  }

  @Get()
  async getServices(@Req() req: any, @Query('organizationId') orgId?: string) {
    const orgIdNum = orgId ? parseInt(orgId) : undefined;
    return this.serviceService.findAllForUser(req.user, orgIdNum);
  }
}
