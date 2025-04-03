import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, organizationId: number) {
    // Ensure the organization exists
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new ForbiddenException('Organization not found');
    return this.prisma.service.create({ data: { name, organizationId } });
  }

  async findAllForUser(user: { id: number; role: string; organizationId?: number }, orgId?: number) {
    if (user.role === 'ADMIN') {
      // Admin: all services or filtered by organization
      const where = orgId ? { organizationId: orgId } : {};
      return this.prisma.service.findMany({
        where,
        select: { id: true, name: true, organizationId: true }
      });
    } else if (user.role === 'USER') {
      if (!user.organizationId) return [];
      const allowedOrg = user.organizationId;
      const targetOrg = orgId ? orgId : allowedOrg;
      if (targetOrg !== allowedOrg) {
        throw new ForbiddenException('Access to this organization is forbidden');
      }
      return this.prisma.service.findMany({
        where: { organizationId: allowedOrg },
        select: { id: true, name: true, organizationId: true }
      });
    } else if (user.role === 'TELEGRAM_CLIENT') {
      // Client: can view services (optionally filtered by organization)
      const where = orgId ? { organizationId: orgId } : {};
      return this.prisma.service.findMany({
        where,
        select: { id: true, name: true, organizationId: true }
      });
    }
    return [];
  }
}
