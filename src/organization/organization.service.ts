import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.organization.create({ data: { name } });
  }

  async findAllForUser(user: { id: number; role: string; organizationId?: number }) {
    if (user.role === 'ADMIN' || user.role === 'TELEGRAM_CLIENT') {
      // Return all organizations
      return this.prisma.organization.findMany({
        select: { id: true, name: true }
      });
    } else if (user.role === 'USER') {
      if (!user.organizationId) return [];
      const org = await this.prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { id: true, name: true }
      });
      return org ? [org] : [];
    }
    return [];
  }
}
