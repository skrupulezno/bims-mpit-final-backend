import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, AddStaffDto } from './company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async createCompany(dto: CreateCompanyDto, userId: number) {
    // Создать новую компанию и привязать текущего пользователя как ADMIN
    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        description: dto.description,
        businessType: dto.businessType as any,
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
    // Проверить права: только админ компании может обновлять информацию
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
        description: dto.description
      }
    });
    return company;
  }

  async addStaff(companyId: number, dto: AddStaffDto, userId: number) {
    // Проверить, что запрашивающий пользователь - админ компании
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для добавления сотрудников');
    }
    // Проверить, что добавляемый пользователь существует
    const userToAdd = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!userToAdd) {
      throw new NotFoundException('Пользователь с таким ID не найден');
    }
    // Создать связь CompanyMember (или обновить роль, если уже есть запись)
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

  async getCompanyById(companyId: number) {
    // Получить информацию о компании (для каталога или внутреннего использования)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { branches: true, members: true }
    });
    if (!company) throw new NotFoundException('Компания не найдена');
    return company;
  }
}