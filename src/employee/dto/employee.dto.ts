import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { EmployeeRole } from '@prisma/client';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EmployeeRole, { message: 'Неверное значение для роли сотрудника' })
  role: EmployeeRole;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(EmployeeRole, { message: 'Неверное значение для роли сотрудника' })
  role?: EmployeeRole;
}
