import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES, TELEGRAM_BOT_TOKEN } from './auth.constants';
import { RegisterDto, LoginDto, TelegramLoginDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const { email, password, name } = dto;
    // Check if email is already taken
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Determine role: first user becomes admin, others default to user
    let role: Role = Role.USER;
    const usersCount = await this.prisma.user.count();
    if (usersCount === 0) {
      role = 'ADMIN';
    }
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hashedPassword, name, role },
    });
    return this.generateTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const pwMatches = user.passwordHash && (await bcrypt.compare(password, user.passwordHash));
    if (!pwMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.role);
  }

  async loginWithTelegram(dto: TelegramLoginDto) {
    const { initData } = dto;
    // Validate Telegram initData signature
    const params = new URLSearchParams(initData);
    const dataObj: { [key: string]: string } = {};
    for (const [key, value] of params.entries()) {
      dataObj[key] = value;
    }
    const telegramHash = dataObj['hash'];
    if (!telegramHash) {
      throw new BadRequestException('Missing hash in Telegram data');
    }
    delete dataObj['hash'];
    // Build the data-check string
    const checkString = Object.keys(dataObj)
      .sort()
      .map(key => `${key}=${dataObj[key]}`)
      .join('\n');
    // Compute secret key using bot token
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(TELEGRAM_BOT_TOKEN)
      .digest();
    const computedHash = crypto.createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');
    if (computedHash !== telegramHash) {
      throw new UnauthorizedException('Invalid Telegram data signature');
    }
    // Parse user information
    let telegramUser;
    try {
      telegramUser = dataObj['user'] ? JSON.parse(dataObj['user']) : null;
    } catch {
      throw new BadRequestException('Invalid Telegram user data');
    }
    if (!telegramUser || !telegramUser.id) {
      throw new BadRequestException('Telegram user data not provided');
    }
    const telegramId = BigInt(telegramUser.id);
    // Find or create user by Telegram ID
    let user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      const fullName = telegramUser.last_name 
        ? `${telegramUser.first_name} ${telegramUser.last_name}` 
        : telegramUser.first_name;
      user = await this.prisma.user.create({
        data: { telegramId, name: fullName, role: 'TELEGRAM_CLIENT' },
      });
    }
    return this.generateTokens(user.id, user.role);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: JWT_REFRESH_SECRET });
      const userId = payload.sub || payload.id;
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      // (In a real app, verify token is not blacklisted or rotated)
      return this.generateTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: number, role: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRES,
    });
    return { accessToken, refreshToken };
  }
}
