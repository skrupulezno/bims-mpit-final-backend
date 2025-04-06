import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, CreateMasterDto, CreateTableDto } from './branch.dto';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async createBranch(companyId: number, dto: CreateBranchDto, userId: number) {
    // Проверка прав: только админ компании может создать филиал
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Только администратор компании может добавлять филиалы');
    }
    const branch = await this.prisma.branch.create({
      data: {
        name: dto.name,
        address: dto.address,
        companyId: companyId
      }
    });
    return branch;
  }

  async addMaster(branchId: number, dto: CreateMasterDto, userId: number) {
    // Проверка: пользователь должен быть админ компании, которой принадлежит филиал
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, include: { company: true } });
    if (!branch) throw new NotFoundException('Филиал не найден');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: branch.companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Нет прав для добавления мастеров в этот филиал');
    }
    // Создаем запись мастера
    const master = await this.prisma.master.create({
      data: {
        name: dto.name,
        photoUrl: dto.photoUrl,
        branchId: branchId,
        userId: dto.userId ?? null
      }
    });
    return master;
  }

  async addTable(branchId: number, dto: CreateTableDto, userId: number) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, include: { company: true } });
    if (!branch) throw new NotFoundException('Филиал не найден');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: branch.companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Нет прав для добавления столов в этот филиал');
    }
    const table = await this.prisma.table.create({
      data: {
        label: dto.label,
        seats: dto.seats,
        branchId: branchId
      }
    });
    return table;
  }

  async findBranchesByCompany(companyId: number, userId: number) {
    // Метод для получения филиалов компании (может использоваться как в админке, так и в каталоге)
    // Проверим, что запрашивающий - член компании (админ или сотрудник) или публичный доступ (userId может быть null)
    if (userId) {
      const member = await this.prisma.companyMember.findUnique({
        where: { userId_companyId: { userId, companyId } }
      });
      if (!member) {
        throw new ForbiddenException('Нет доступа к филиалам этой компании');
      }
    }
    return this.prisma.branch.findMany({
      where: { companyId: companyId },
      include: { services: true, masters: true, tables: true }
    });
  }
}