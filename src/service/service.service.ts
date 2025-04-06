import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, AddComponentDto, CreateCustomFieldDto } from './service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createService(branchId: number, dto: CreateServiceDto, userId: number) {
    // Проверка прав: только админ компании, владеющей филиалом, может добавлять услуги
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, include: { company: true } });
    if (!branch) throw new NotFoundException('Филиал не найден');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: branch.companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Недостаточно прав для добавления услуги в этот филиал');
    }
    // Создаем услугу
    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        durationMin: dto.durationMin,
        price: dto.price,
        branchId: branchId
      }
    });
    // Если при создании указаны флаги requiresMaster/ requiresTable, добавим компоненты
    const componentsToAdd: AddComponentDto[] = [];
    if (dto.requiresMaster) {
      componentsToAdd.push({ type: 'MASTER', name: 'Выбор мастера', isRequired: true });
    }
    if (dto.requiresTable) {
      componentsToAdd.push({ type: 'TABLE', name: 'Выбор стола', isRequired: true });
    }
    for (const comp of componentsToAdd) {
      await this.prisma.serviceComponent.create({
        data: {
          type: comp.type as any,
          name: comp.name,
          isRequired: comp.isRequired ?? true,
          serviceId: service.id
        }
      });
    }
    return service;
  }

  async addComponent(serviceId: number, dto: AddComponentDto, userId: number) {
    // Проверяем, что пользователь - админ компании, владеющей услугой
    const service = await this.prisma.service.findUnique({ where: { id: serviceId }, include: { branch: { include: { company: true } } } });
    if (!service) throw new NotFoundException('Услуга не найдена');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: service.branch.companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Нет прав для изменения этой услуги');
    }
    // Создаем запись компонента услуги
    const comp = await this.prisma.serviceComponent.create({
      data: {
        type: dto.type as any,
        name: dto.name,
        isRequired: dto.isRequired ?? true,
        serviceId: serviceId
      }
    });
    return comp;
  }

  async addCustomField(serviceId: number, dto: CreateCustomFieldDto, userId: number) {
    // Проверяем права аналогично
    const service = await this.prisma.service.findUnique({ where: { id: serviceId }, include: { branch: { include: { company: true } } } });
    if (!service) throw new NotFoundException('Услуга не найдена');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: service.branch.companyId } }
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Нет прав для изменения этой услуги');
    }
    const field = await this.prisma.customField.create({
      data: {
        label: dto.label,
        fieldType: dto.fieldType as any,
        isRequired: dto.isRequired ?? false,
        options: dto.options,
        serviceId: serviceId
      }
    });
    return field;
  }

  async getServicesByBranch(branchId: number) {
    // Получить все услуги филиала (например, для отображения, доступно публично)
    return this.prisma.service.findMany({
      where: { branchId: branchId },
      include: { components: true, customFields: true, masters: true }
    });
  }
}
