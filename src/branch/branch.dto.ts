import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  address?: string;
}

export class UpdateBranchDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  address?: string;
}

export class CreateMasterDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  photoUrl?: string;

  // userId можно опционально указать, если сразу привязывается аккаунт сотрудника
  @IsOptional()
  userId?: number;
}

export class CreateTableDto {
  @IsNotEmpty()
  label: string;  // номер или название стола

  @IsNotEmpty()
  seats: number;
}
