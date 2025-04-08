import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { BusinessModule } from './business/business.module';
import { ServicesModule } from './services/services.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TelegramModule,
    BusinessModule,
    EmployeeModule,
    ServicesModule
  ],
})
export class AppModule {}
