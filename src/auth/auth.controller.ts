import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramOAuthDto, TelegramMiniAppDto } from './dto/telegram.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('oauth')
  @HttpCode(HttpStatus.OK)
  async telegramOAuth(@Body() telegramData: TelegramOAuthDto) {
    return await this.authService.validateTelegramOAuth(telegramData);
  }

  @Post('miniapp')
  @HttpCode(HttpStatus.OK)
  async telegramMiniApp(@Body() telegramData: TelegramMiniAppDto) {
    return await this.authService.validateTelegramMiniApp(telegramData);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Req() req) {
    return req.user;
  }
}
