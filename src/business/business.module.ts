import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessController],
})
export class BusinessModule {}
