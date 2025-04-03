import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  
  @IsNotEmpty()
  password: string;
  
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;
  
  @IsNotEmpty()
  password: string;
}

export class TelegramLoginDto {
  @IsNotEmpty()
  initData: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
