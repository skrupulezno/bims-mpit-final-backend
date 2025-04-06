
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterBusinessDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() dto: RegisterUserDto) {
    const user = await this.authService.registerUser(dto);
    return { id: user.id, email: user.email, name: user.name };
  }

  @Post('register-business')
  async registerBusiness(@Body() dto: RegisterBusinessDto) {
    const user = await this.authService.registerBusiness(dto);
    return { message: 'Бизнес зарегистрирован', adminUserId: user.id };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}