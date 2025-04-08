import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
