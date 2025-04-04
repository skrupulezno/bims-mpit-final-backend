import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { ServiceModule } from './service/service.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    OrganizationModule,
    ServiceModule,
    BookingModule,
  ],
})
export class AppModule {}
