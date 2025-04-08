import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramOAuthDto, TelegramMiniAppDto } from './dto/telegram.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateTelegramOAuth(data: TelegramOAuthDto) {
    // Используем findFirst вместо findUnique
    let user = await this.prisma.user.findFirst({
      where: { telegramId: data.telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: data.telegramId,
          name: data.name,
          authProvider: 'TELEGRAM_OAUTH',
        },
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId, name: user.name };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '120m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { status: 'success', accessToken, refreshToken };
  }

  async validateTelegramMiniApp(data: TelegramMiniAppDto) {
    // Используем findFirst вместо findUnique
    let user = await this.prisma.user.findFirst({
      where: { telegramId: data.telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: data.telegramId,
          name: data.name,
          authProvider: 'TELEGRAM_MINIAPP',
        },
      });
    }

    const payload = { sub: user.id, telegramId: user.telegramId, name: user.name };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '120m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { status: 'success', accessToken, refreshToken };
  }
}
