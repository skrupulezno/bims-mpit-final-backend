import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(@Body() dto: CreateBookingDto, @Req() req) {
    const userId = req.user.id;
    const booking = await this.bookingService.createBooking(userId, dto);
    return { message: 'Бронирование успешно создано', bookingId: booking.id };
  }

  @Get('branches/:branchId')
  @UseGuards(JwtAuthGuard)
  async getBranchBookings(@Param('branchId') branchId: string, @Req() req) {
    const userId = req.user.id;
    return this.bookingService.getBookingsForBranch(Number(branchId), userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@Req() req) {
    const userId = req.user.id;
    return this.bookingService.getMyBookings(userId);
  }
}