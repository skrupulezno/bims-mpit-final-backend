import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  durationMin?: number;  // длительность услуги, мин

  @IsOptional()
  price?: number;

  // Флаги или компоненты, определяющие требование выбора мастера/стола
  @IsOptional()
  requiresMaster?: boolean;

  @IsOptional()
  requiresTable?: boolean;
}

export class AddComponentDto {
  @IsEnum(["MASTER","TABLE"])
  type: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  isRequired?: boolean;
}

export class CreateCustomFieldDto {
  @IsNotEmpty()
  label: string;

  @IsEnum(["TEXT","NUMBER","SELECT","BOOLEAN"])
  fieldType: string;

  @IsOptional()
  isRequired?: boolean;

  @IsOptional()
  options?: string;  // например, список вариантов для SELECT (формат JSON или CSV)
}
