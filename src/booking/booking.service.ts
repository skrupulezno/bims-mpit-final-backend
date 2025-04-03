import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(serviceId: number, userId: number) {
    // Ensure the service exists
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Service not found');
    return this.prisma.booking.create({ data: { serviceId, userId } });
  }

  async findAllForUser(user: { id: number; role: string; organizationId?: number }) {
    if (user.role === 'ADMIN') {
      // Admin: all bookings
      return this.prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { include: { organization: { select: { id: true, name: true } } } }
        }
      });
    } else if (user.role === 'USER') {
      // Employee: bookings for their organization
      if (!user.organizationId) return [];
      return this.prisma.booking.findMany({
        where: { service: { organizationId: user.organizationId } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { include: { organization: { select: { id: true, name: true } } } }
        }
      });
    } else if (user.role === 'TELEGRAM_CLIENT') {
      // Client: their own bookings
      return this.prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { include: { organization: { select: { id: true, name: true } } } }
        }
      });
    }
    return [];
  }
}
