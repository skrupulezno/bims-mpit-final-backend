import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_ACCESS_SECRET } from './auth.constants';
import { AuthController } from './auth.controller';
import { UserModule  } from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
