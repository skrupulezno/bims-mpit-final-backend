import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @Roles('TELEGRAM_CLIENT')
  async createBooking(@Req() req: any, @Body('serviceId') serviceId: number) {
    return this.bookingService.create(serviceId, req.user.id);
  }

  @Get()
  async getBookings(@Req() req: any) {
    return this.bookingService.findAllForUser(req.user);
  }
}
