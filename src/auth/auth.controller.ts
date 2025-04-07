import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterBusinessDto, LoginDto } from './dto/auth.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import {  HttpStatus, Res, BadRequestException } from '@nestjs/common';
import { parse, isValid } from '@telegram-apps/init-data-node';
import {UserService} from '../user/user.service';
import { JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET } from './auth.constants';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

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

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('/telegram')
  async telegramAuth(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    // Извлекаем initData из тела запроса
    const { initData } = req.body as { initData: string };

    // Валидируем initData с использованием токена вашего Telegram-бота
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const isDataValid = isValid(initData, botToken);
    if (!isDataValid) {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    // Парсим initData и получаем данные пользователя Telegram
    const data = parse(initData);
    const tgUser = data.user;
    if (!tgUser || !tgUser.id) {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    // Пытаемся найти пользователя по Telegram ID
    let user = await this.userService.getUserByTgId({ tg_id: tgUser.id });
    // Если пользователь не найден, создаем его автоматически
    if (!user) {
      user = await this.userService.createUserFromTelegramData({
        tg_id: tgUser.id,
        name: tgUser.first_name, // можно добавить last_name или username, если нужно
        // Так как email не приходит из Telegram, генерируем фиктивный email
        email: `${tgUser.id}@telegram.com`,
        passwordHash: '', // Пароль не используется, так как вход без регистрации
      });
    }

     const payload = { sub: tgUser.id, email: `${tgUser.id}@telegram.com` };
    
        const accessToken = this.jwtService.sign(payload, {
          secret: JWT_ACCESS_SECRET,
          expiresIn: JWT_ACCESS_EXPIRES,
        });
    
        const refreshToken = this.jwtService.sign(payload, {
          secret: JWT_REFRESH_SECRET,
          expiresIn: JWT_REFRESH_EXPIRES,
        });


    // Возвращаем токены в ответе
    res.status(HttpStatus.OK).send({
      success: true,
      accessToken,
      refreshToken,
    });
    
  }
}