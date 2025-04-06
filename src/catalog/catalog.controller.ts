import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('companies')
  async listCompanies() {
    return this.catalogService.listCompanies();
  }

  @Get('companies/:id')
  async getCompany(@Param('id') id: string) {
    const company = await this.catalogService.getCompanyDetails(Number(id));
    return company ?? { error: 'Компания не найдена' };
  }

  @Get('services')
  async searchServices(@Query('q') q: string) {
    return this.catalogService.searchServices(q || '');
  }
}