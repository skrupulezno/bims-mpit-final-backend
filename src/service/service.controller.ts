import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto, AddComponentDto, CreateCustomFieldDto } from './service.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('branches/:branchId/services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createService(@Param('branchId') branchId: string, @Body() dto: CreateServiceDto, @Req() req) {
    const userId = req.user.id;
    return this.serviceService.createService(Number(branchId), dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listServices(@Param('branchId') branchId: string, @Req() req) {
    // Можно позволить и неавторизованным пользователям видеть услуги (каталог), 
    // но если этот маршрут планируется только для админки, можно требовать JWT.
    return this.serviceService.getServicesByBranch(Number(branchId));
  }

  @Post(':serviceId/components')
  @UseGuards(JwtAuthGuard)
  async addComponent(@Param('branchId') branchId: string, @Param('serviceId') serviceId: string,
                     @Body() dto: AddComponentDto, @Req() req) {
    const userId = req.user.id;
    return this.serviceService.addComponent(Number(serviceId), dto, userId);
  }

  @Post(':serviceId/custom-fields')
  @UseGuards(JwtAuthGuard)
  async addCustomField(@Param('branchId') branchId: string, @Param('serviceId') serviceId: string,
                       @Body() dto: CreateCustomFieldDto, @Req() req) {
    const userId = req.user.id;
    return this.serviceService.addCustomField(Number(serviceId), dto, userId);
  }
}