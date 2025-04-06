import { Controller, Post, Body, Param, Get, Req, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto, CreateMasterDto, CreateTableDto } from './branch.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('companies/:companyId/branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBranch(@Param('companyId') companyId: string, @Body() dto: CreateBranchDto, @Req() req) {
    const userId = req.user.id;
    return this.branchService.createBranch(Number(companyId), dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBranches(@Param('companyId') companyId: string, @Req() req) {
    const userId = req.user.id;
    return this.branchService.findBranchesByCompany(Number(companyId), userId);
  }

  @Post(':branchId/masters')
  @UseGuards(JwtAuthGuard)
  async addMaster(@Param('companyId') companyId: string, @Param('branchId') branchId: string, 
                  @Body() dto: CreateMasterDto, @Req() req) {
    const userId = req.user.id;
    // companyId из параметров можно не использовать напрямую, 
    // branchService сам определит принадлежность филиала к компании и проверит права
    return this.branchService.addMaster(Number(branchId), dto, userId);
  }

  @Post(':branchId/tables')
  @UseGuards(JwtAuthGuard)
  async addTable(@Param('companyId') companyId: string, @Param('branchId') branchId: string, 
                 @Body() dto: CreateTableDto, @Req() req) {
    const userId = req.user.id;
    return this.branchService.addTable(Number(branchId), dto, userId);
  }
}