import { Controller, Post, Get, Patch, Body, Param, Req, UsePipes, ValidationPipe, UseGuards, Delete, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/services.dto';
import { IsMongoId } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

// DTO для проверки ObjectId параметров (например, businessId, serviceId)
export class ObjectIdParamDto {
  @IsMongoId({ message: 'Неверный формат ObjectId' })
  id: string;
}

export class BusinessIdParamDto {
    @IsMongoId({ message: 'Неверный формат ObjectId' })
    businessId: string;
  }

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getServicesByBusinessId(@Param() params: BusinessIdParamDto) {
    const services = await this.prisma.module.findMany({
      where: {
        businessId: params.businessId,
      },
    });
    return services;
  }

  // Роут для создания услуги для бизнеса типа SERVICE (например, тестовый)
  @Post('/test1/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createServiceTest1(
    @Param('businessId') businessId: string,
    @Body() dto: CreateServiceDto,
    @Req() req
  ) {
    const serviceModule = await this.prisma.module.create({
      data: {
        moduleType: dto.moduleType,
        business: { connect: { id: businessId } },
        customParameters: dto.customParameters,
      },
    });
    return serviceModule;
  }

  // Роут для создания услуги для бизнеса типа REAL_ESTATE (например, тестовый)
  @Post('/test2/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createServiceTest2(
    @Param('businessId') businessId: string,
    @Body() dto: CreateServiceDto,
    @Req() req
  ) {
    const serviceModule = await this.prisma.module.create({
      data: {
        moduleType: dto.moduleType,
        business: { connect: { id: businessId } },
        customParameters: dto.customParameters,
      },
    });
    return serviceModule;
  }

  @Post('/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createServiceForCompany(
    @Param('businessId') businessId: string,
    @Body() dto: CreateServiceDto,
    @Req() req
  ) {
    const serviceModule = await this.prisma.module.create({
      data: {
        moduleType: dto.moduleType,
        business: { connect: { id: businessId } },
        customParameters: dto.customParameters,
      },
    });
    return serviceModule;
  }

  // Роут для обновления существующей услуги
  @Patch('/:serviceId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
    @Req() req
  ) {
    const updatedService = await this.prisma.module.update({
      where: { id: serviceId },
      data: {
        customParameters: dto.customParameters,
      },
    });
    return updatedService;
  }

  @Delete('/:serviceId')
  async deleteService(@Param('serviceId') serviceId: string, @Req() req) {
    // Проверка авторизации
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    // Поиск сервиса по id
    const service = await this.prisma.module.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Сервис не найден');
    }

    // Поиск бизнеса, которому принадлежит сервис, для проверки прав доступа
    const business = await this.prisma.business.findUnique({
      where: { id: service.businessId },
    });
    if (!business) {
      throw new NotFoundException('Бизнес, связанный с сервисом, не найден');
    }
    if (business.ownerId !== req.user.id) {
      throw new ForbiddenException('Нет прав для удаления сервиса данного бизнеса');
    }

    // Удаление сервиса
    await this.prisma.module.delete({
      where: { id: serviceId },
    });

    return { message: 'Сервис успешно удалён' };
  }
}
