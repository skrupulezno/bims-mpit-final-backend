import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { BusinessType } from '@prisma/client';

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsEnum(BusinessType, { message: 'Неверное значение типа бизнеса' })
  type: BusinessType;

  // Допустим, что theme и workingHours передаются в виде JSON-объектов
  @IsOptional()
  theme?: any;

  @IsOptional()
  workingHours?: any;
}

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  theme?: any;

  @IsOptional()
  workingHours?: any;
}
