import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @MinLength(6)
  password?: string;
}
