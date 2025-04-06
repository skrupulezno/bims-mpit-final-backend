import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;
}

export class RegisterBusinessDto extends RegisterUserDto {
  @IsNotEmpty()
  companyName: string;

  @IsNotEmpty()
  businessType: string;  // Expect values like "BARBERSHOP" or "RESTAURANT"
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
