import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';  
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto, RegisterBusinessDto, LoginDto } from './dto/auth.dto';
import { JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async registerUser(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email уже зарегистрирован');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashed,
        name: dto.name,
      },
    });
    return user;
  }

  async registerBusiness(dto: RegisterBusinessDto) {
    // Зарегистрировать пользователя и компанию в одной транзакции
    return this.prisma.$transaction(async (prisma) => {
      // Создаем пользователя-админа
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashed,
          name: dto.name,
        },
      });
      // Создаем компанию
      const company = await prisma.company.create({
        data: {
          name: dto.companyName,
          description: '', 
          businessType: dto.businessType as any, // cast string to BusinessType enum
        },
      });
      // Связываем пользователя как ADMIN компании
      await prisma.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'ADMIN',
        },
      });
      return user;
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const pwMatches = await bcrypt.compare(password, user.passwordHash);
    return pwMatches ? user : null;
  }

 
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRES,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
  

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }
      const newPayload = { sub: user.id, email: user.email };
  
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: JWT_ACCESS_SECRET,
        expiresIn: JWT_ACCESS_EXPIRES,
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: JWT_REFRESH_SECRET,
        expiresIn: JWT_REFRESH_EXPIRES,
      });
  
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Неверный refresh token');
    }
  }
}
