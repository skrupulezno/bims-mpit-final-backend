import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  businessType: string; // BusinessType enum as string

  @IsOptional()
  description?: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;
}

export class AddStaffDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  role: string; // expected "STAFF" or "ADMIN"
}
