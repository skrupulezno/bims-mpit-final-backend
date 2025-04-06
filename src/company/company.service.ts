import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, AddStaffDto } from './company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async createCompany(dto: CreateCompanyDto, userId: number) {
    // Создаем компанию с новыми полями и привязываем текущего пользователя как ADMIN
    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        description: dto.description,
        businessType: dto.businessType as any,
        businessTerm: dto.businessTerm,
        city: dto.city,
        street: dto.street,
        workTime: dto.workTime,
        holidays: dto.holidays,
        descriptionAI: dto.descriptionAI,
        logo: dto.logo,
        calendar: dto.calendar,
        analytics: dto.analytics,
        telegram: dto.telegram,
        aiText: dto.aiText,
        socials: dto.socials,
        delivery: dto.delivery,
        members: {
          create: [
            {
              userId: userId,
              role: 'ADMIN'
            }
          ]
        }
      }
    });
    return company;
  }

  async updateCompany(companyId: number, dto: UpdateCompanyDto, userId: number) {
    // Проверяем, что пользователь является администратором компании
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Только админ компании может обновлять информацию о компании');
    }
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: dto.name,
        description: dto.description,
        businessTerm: dto.businessTerm,
        city: dto.city,
        street: dto.street,
        workTime: dto.workTime,
        holidays: dto.holidays,
        descriptionAI: dto.descriptionAI,
        logo: dto.logo,
        calendar: dto.calendar,
        analytics: dto.analytics,
        telegram: dto.telegram,
        aiText: dto.aiText,
        socials: dto.socials,
        delivery: dto.delivery,
      }
    });
    return company;
  }

  async addStaff(companyId: number, dto: AddStaffDto, userId: number) {
    // Проверяем, что запрашивающий пользователь является администратором компании
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для добавления сотрудников');
    }
    // Проверяем, что пользователь, которого нужно добавить, существует
    const userToAdd = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!userToAdd) {
      throw new NotFoundException('Пользователь с таким ID не найден');
    }
    // Создаем или обновляем запись CompanyMember
    const memberRecord = await this.prisma.companyMember.upsert({
      where: { userId_companyId: { userId: dto.userId, companyId } },
      create: {
        userId: dto.userId,
        companyId: companyId,
        role: dto.role as any
      },
      update: {
        role: dto.role as any
      }
    });
    return memberRecord;
  }
  
  async getMyCompanies2(userId: number): Promise<number[]> {
    // Находим записи, где пользователь является администратором компании
    const memberships = await this.prisma.companyMember.findMany({
      where: { userId, role: 'ADMIN' },
      select: { companyId: true }
    });
    return memberships.map(m => m.companyId);
  }
  
  async getCompanyById(companyId: number) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }
  
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { branches: true, members: true },
    });
  
    if (!company) throw new NotFoundException('Компания не найдена');
    return company;
  }

  async getUserCompanies(userId: number) {
    const memberships = await this.prisma.companyMember.findMany({
      where: { userId },
      include: { company: true },
    });
  
    const adminCompanies = memberships
      .filter(member => member.role === 'ADMIN')
      .map(member => member.company);
  
    const memberCompanies = memberships
      .filter(member => member.role === 'STAFF')
      .map(member => member.company);
  
    return { adminCompanies, memberCompanies };
  }
}
