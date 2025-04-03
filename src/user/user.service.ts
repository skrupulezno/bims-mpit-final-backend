import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    // Retrieve user profile without sensitive fields
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramId: true,
        organization: { select: { id: true, name: true } }
      }
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.password !== undefined && dto.password.trim() !== '') {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (Object.keys(data).length === 0) {
      return this.getProfile(userId);
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramId: true,
        organization: { select: { id: true, name: true } }
      }
    });
    return updated;
  }
}
