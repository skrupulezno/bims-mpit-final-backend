import { Controller, Get, Post, Patch, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { IsMongoId } from 'class-validator';

// DTO для проверки ObjectId (например, businessId и employeeId)
export class ObjectIdParamDto {
  @IsMongoId({ message: 'Неверный формат ObjectId' })
  id: string;
}

@Controller('employee')
export class EmployeeController {
  constructor(private readonly prisma: PrismaService) {}

  // Получение сотрудников конкретного бизнеса
  @Get('/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getEmployees(@Param('businessId') businessId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { businessId },
    });
    return employees;
  }

  // Добавление сотрудника в бизнес
  @Post('/:businessId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async addEmployee(
    @Param('businessId') businessId: string,
    @Body() dto: CreateEmployeeDto
  ) {
    const newEmployee = await this.prisma.employee.create({
      data: {
        name: dto.name,
        role: dto.role,
        business: { connect: { id: businessId } },
      },
    });
    return newEmployee;
  }

  // Частичное обновление сотрудника
  @Patch('/:employeeId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateEmployee(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateEmployeeDto
  ) {
    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: dto.name,
        role: dto.role,
      },
    });
    return updatedEmployee;
  }
}
