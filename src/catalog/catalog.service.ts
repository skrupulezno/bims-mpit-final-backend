import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listCompanies() {
    // Получить все компании с их филиалами и услугами
    return this.prisma.company.findMany({
      include: {
        branches: {
          include: {
            services: true
          }
        }
      }
    });
  }

  async getCompanyDetails(companyId: number) {
    // Найти компанию по ID с филиалами, услугами и ресурсами
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        branches: {
          include: {
            services: { include: { components: true, customFields: true } },
            masters: true,
            tables: true
          }
        }
      }
    });
  }

  async searchServices(query: string) {
    // Пример: поиск услуг по названию (всех компаний)
    return this.prisma.service.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      include: { branch: { include: { company: true } } }
    });
  }
}