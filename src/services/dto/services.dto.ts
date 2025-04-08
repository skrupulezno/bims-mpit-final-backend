import { IsNotEmpty, IsOptional } from 'class-validator';
import { ModuleType } from '@prisma/client';

export class CreateServiceDto {
  @IsNotEmpty()
  moduleType: ModuleType; 

  @IsOptional()
  customParameters?: any;
}

export class UpdateServiceDto {
  @IsOptional()
  customParameters?: any;
}
