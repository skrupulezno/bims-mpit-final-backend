import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramOAuthDto, TelegramMiniAppDto } from './dto/telegram.dto';

const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '120m';
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateTelegramOAuth(data: TelegramOAuthDto) {
    try {
      let user = await this.prisma.user.findUnique({
        where: { telegramId: data.telegramId },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: data.telegramId,
            name: data.name,
            email: data.email,
            authProvider: 'TELEGRAM_OAUTH', 
          },
        });
      }

      const payload = { sub: user.id, telegramId: user.telegramId, name: user.name };

      const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: refreshTokenExpiresIn });

      return { status: 'success', accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error processing Telegram OAuth', error);
      throw new InternalServerErrorException('Error processing Telegram OAuth');
    }
  }

  async validateTelegramMiniApp(data: TelegramMiniAppDto) {
    try {
      let user = await this.prisma.user.findUnique({
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

      const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: refreshTokenExpiresIn });

      return { status: 'success', accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error processing Telegram MiniApp', error);
      throw new InternalServerErrorException('Error processing Telegram MiniApp');
    }
  }
}
