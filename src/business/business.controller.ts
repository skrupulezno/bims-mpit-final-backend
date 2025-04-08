import { 
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    UsePipes,
    ValidationPipe,
    Req,
    UnauthorizedException,
    UseGuards, 
    Delete,
    NotFoundException,
    ForbiddenException
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';
  import { IsMongoId } from 'class-validator';
  import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
  
  // DTO для проверки ObjectId (например, для параметра id)
  export class ObjectIdParamDto {
    @IsMongoId({ message: 'Неверный формат ObjectId' })
    id: string;
  }
  
  @UseGuards(JwtAuthGuard)
  @Controller('business')
  export class BusinessController {
    constructor(private readonly prisma: PrismaService) {}
  
    // Создание бизнеса (с установкой владельца, получаемого из req.user)
    @Post()
    async createBusiness(@Body() dto: CreateBusinessDto, @Req() req) {
      const defaultWorkingHours = [
        { day: "Monday",    start: "09:00", end: "18:00" },
        { day: "Tuesday",   start: "09:00", end: "18:00" },
        { day: "Wednesday", start: "09:00", end: "18:00" },
        { day: "Thursday",  start: "09:00", end: "18:00" },
        { day: "Friday",    start: "09:00", end: "18:00" },
        { day: "Saturday",  start: "09:00", end: "18:00" },
        { day: "Sunday",    start: "09:00", end: "18:00" }
      ];
  
      const newBusiness = await this.prisma.business.create({
        data: {
          name: dto.name,
          description: dto.description,
          image: dto.image,
          type: dto.type,
          theme: dto.theme,
          workingHours: dto.workingHours || defaultWorkingHours,
          owner: { connect: { id: req.user.id } },
        },
      });
      return newBusiness;
    }
  
    @Get('admin')
    async getMyBusinessesWithServices(@Req() req) {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Пользователь не авторизован');
      }
      
      // Получаем все бизнесы, где пользователь является владельцем
      const businesses = await this.prisma.business.findMany({
        where: {
          ownerId: req.user.id,
        },
      });

      // Для каждого бизнеса получаем связанные сервисы из таблицы Module
      const results = await Promise.all(businesses.map(async (business) => {
        const services = await this.prisma.module.findMany({
          where: {
            businessId: business.id,
          },
        });
        return {
          ...business,
          services,
        };
      }));

      return results;
    }

     // Метод для удаления бизнеса
  @Delete('/:businessId')
  async deleteBusiness(@Param('businessId') businessId: string, @Req() req) {
    // Проверка авторизации
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    // Проверка существования бизнеса
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Бизнес не найден');
    }

    // Проверка, что текущий пользователь является владельцем бизнеса
    if (business.ownerId !== req.user.id) {
      throw new ForbiddenException('Нет прав для удаления этого бизнеса');
    }

    // Удаление бизнеса
    await this.prisma.business.delete({
      where: { id: businessId },
    });

    return { message: 'Бизнес успешно удалён' };
  }
  
    // Эндпоинт для получения всех бизнесов (не только тех, где пользователь является владельцем)
    @Get('all')
    async getAllBusinesses() {
      const businesses = await this.prisma.business.findMany({});
      return businesses;
    }
  
    // Частичное обновление бизнеса по его id с валидацией параметра
    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateBusiness(
      @Param() params: ObjectIdParamDto,
      @Body() dto: UpdateBusinessDto,
      @Req() req
    ) {
      const updatedBusiness = await this.prisma.business.update({
        where: { id: params.id },
        data: {
          name: dto.name,
          description: dto.description,
          image: dto.image,
          theme: dto.theme,
          workingHours: dto.workingHours,
        },
      });
      return updatedBusiness;
    }
  }
  