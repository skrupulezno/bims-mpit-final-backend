import { IsNotEmpty, IsISO8601, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @IsNotEmpty()
  @IsISO8601()
  dateTime: string;  // дата и время начала брони (в формате ISO8601)

  @IsOptional()
  @IsInt()
  masterId?: number;

  @IsOptional()
  @IsInt()
  tableId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldValueDto)
  customFields?: CustomFieldValueDto[];
}

export class CustomFieldValueDto {
  @IsNotEmpty()
  fieldId: number;

  @IsNotEmpty()
  value: string;
}
