import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto, AddStaffDto } from './company.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)  // пользователь должен быть аутентифицирован
  async createCompany(@Body() dto: CreateCompanyDto, @Req() req) {
    const userId = req.user.id;
    const company = await this.companyService.createCompany(dto, userId);
    return company;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCompany(@Param('id') id: number, @Body() dto: UpdateCompanyDto, @Req() req) {
    const userId = req.user.id;
    return this.companyService.updateCompany(Number(id), dto, userId);
  }

  @Post(':id/staff')
  @UseGuards(JwtAuthGuard)
  async addStaff(@Param('id') id: number, @Body() dto: AddStaffDto, @Req() req) {
    const userId = req.user.id;
    await this.companyService.addStaff(Number(id), dto, userId);
    return { message: 'Сотрудник добавлен в компанию' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyCompanies(@Req() req) {
    const userId = req.user.id;
    return this.companyService.getMyCompanies2(userId);
  }

  @Get(':id')
  async getCompanyById(@Param('id', ParseIntPipe) companyId: number) {
    return this.companyService.getCompanyById(companyId);
  }
  
}