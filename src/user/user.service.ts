import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserByTgId({ tg_id }: { tg_id: number }): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { tg_id },
    });
  }
  

  async createUserFromTelegramData(dto: {
    tg_id: number;
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        tg_id: dto.tg_id,
        name: dto.name,
        email: dto.email,
        passwordHash: dto.passwordHash,
      },
    });
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        memberships: {
          select: {
            role: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
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
        memberships: {
          select: {
            role: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return updated;
  }
  
}
