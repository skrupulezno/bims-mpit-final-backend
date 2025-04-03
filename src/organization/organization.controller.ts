import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  @Roles('ADMIN')
  async createOrganization(@Body('name') name: string) {
    return this.organizationService.create(name);
  }

  @Get()
  async getOrganizations(@Req() req: any) {
    return this.organizationService.findAllForUser(req.user);
  }
}
