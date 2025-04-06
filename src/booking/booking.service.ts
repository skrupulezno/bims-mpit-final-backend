import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: number, dto: CreateBookingDto) {
    // 1. Получаем услугу и связанные данные (включая филиал, компоненты, поля, мастеров)
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { branch: true, components: true, customFields: true, masters: true, }
    });
    if (!service) throw new NotFoundException('Услуга не найдена');
    const branch = service.branch;
    // 2. Проверяем, требуется ли выбор мастера/стола и переданы ли они
    const requiresMaster = service.components.some(c => c.type === 'MASTER');
    const requiresTable = service.components.some(c => c.type === 'TABLE');
    if (requiresMaster && !dto.masterId) {
      throw new BadRequestException('Необходимо выбрать мастера для этой услуги');
    }
    if (requiresTable && !dto.tableId) {
      throw new BadRequestException('Необходимо выбрать стол для этой услуги');
    }
    // 3. Если мастер указан, проверяем что он принадлежит этому филиалу и может выполнять эту услугу
    let selectedMaster = null;
    if (dto.masterId) {
      selectedMaster = await this.prisma.master.findFirst({
        where: {
          id: dto.masterId,
          branchId: branch.id,
          services: { some: { id: service.id } }
        }
      });
      if (!selectedMaster) {
        throw new BadRequestException('Выбранный мастер недоступен для этой услуги/филиала');
      }
    }
    // 4. Если стол указан, проверяем что он принадлежит филиалу
    let selectedTable = null;
    if (dto.tableId) {
      selectedTable = await this.prisma.table.findFirst({
        where: {
          id: dto.tableId,
          branchId: branch.id
        }
      });
      if (!selectedTable) {
        throw new BadRequestException('Выбранный стол не принадлежит данному филиалу');
      }
    }
    // 5. Проверка дополнительных полей: все обязательные должны быть заполнены
    const requiredFields = service.customFields.filter(f => f.isRequired);
    if (requiredFields.length) {
      // Преобразуем массив переданных значений в словарь fieldId -> value
      const providedValues = new Map<number, string>();
      dto.customFields?.forEach(fv => {
        providedValues.set(fv.fieldId, fv.value);
      });
      for (const field of requiredFields) {
        if (!providedValues.has(field.id) || providedValues.get(field.id)?.trim() === '') {
          throw new BadRequestException(`Поле "${field.label}" обязательно для заполнения`);
        }
      }
    }
    // 6. Проверка занятости (мастер или стол на это же время)
    // Например, нельзя бронировать двух клиентов к одному мастеру на одно время. 
    // Упрощенно проверим пересечение по началу времени для данного мастера/стола:
    const startTime = new Date(dto.dateTime);
    if (selectedMaster) {
      const conflict = await this.prisma.booking.findFirst({
        where: {
          masterId: selectedMaster.id,
          dateTime: startTime
        }
      });
      if (conflict) {
        throw new BadRequestException('Данный мастер уже занят на это время');
      }
    }
    if (selectedTable) {
      const conflict = await this.prisma.booking.findFirst({
        where: {
          tableId: selectedTable.id,
          dateTime: startTime
        }
      });
      if (conflict) {
        throw new BadRequestException('Этот стол уже забронирован на выбранное время');
      }
    }
    // 7. Создаем бронирование
    const booking = await this.prisma.booking.create({
      data: {
        dateTime: startTime,
        status: 'PENDING',
        userId: userId,
        serviceId: service.id,
        branchId: branch.id,
        masterId: selectedMaster ? selectedMaster.id : null,
        tableId: selectedTable ? selectedTable.id : null
      }
    });
    // 8. Сохранение значений дополнительных полей
    if (dto.customFields) {
      for (const fieldValue of dto.customFields) {
        await this.prisma.bookingCustomFieldValue.create({
          data: {
            bookingId: booking.id,
            customFieldId: fieldValue.fieldId,
            value: fieldValue.value
          }
        });
      }
    }
    return booking;
  }

  async getBookingsForBranch(branchId: number, userId: number) {
    // Проверка: пользователь должен быть сотрудником или админом компании, чтобы видеть брони филиала
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, include: { company: true } });
    if (!branch) throw new NotFoundException('Филиал не найден');
    const member = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: branch.companyId } }
    });
    if (!member || (member.role !== 'ADMIN' && member.role !== 'STAFF')) {
      throw new ForbiddenException('Нет доступа к бронированиям этого филиала');
    }
    // Если это сотрудник (MASTER) со связанным userId, можно отфильтровать только его брони
    const master = await this.prisma.master.findFirst({ where: { branchId: branchId, userId: userId } });
    const bookings = await this.prisma.booking.findMany({
      where: {
        branchId: branchId,
        ...(master ? { masterId: master.id } : {})  // если пользователь является мастером филиала, покажем только его записи
      },
      include: { user: true, service: true, master: true, table: true, customFieldValues: true }
    });
    return bookings;
  }

  async getMyBookings(userId: number) {
    // Вернуть брони, созданные данным пользователем (клиентом)
    return this.prisma.booking.findMany({
      where: { userId: userId },
      include: { service: { include: { branch: { include: { company: true } } } }, master: true, table: true, customFieldValues: true }
    });
  }
}
