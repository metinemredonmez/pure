import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PartnerService } from './partner.service';

// DTOs
class CreateSaleDto {
  amount: number;
  commission?: number;
  latitude?: number;
  longitude?: number;
  region?: string;
  note?: string;
}

class UpdatePartnerProfileDto {
  companyName?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  partnerRegion?: string;
}

@ApiTags('Partner Portal')
@ApiBearerAuth()
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  // ============================================
  // PARTNER OWN ENDPOINTS
  // ============================================

  @Get('dashboard')
  @Roles('PARTNER' as any)
  @ApiOperation({ summary: 'Partner dashboard — özet metrikler' })
  async getDashboard(@CurrentUser() user: any) {
    return this.partnerService.getDashboard(user.sub);
  }

  @Get('sales')
  @Roles('PARTNER' as any)
  @ApiOperation({ summary: 'Partner satışları listele' })
  async getSales(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.partnerService.getSales(
      user.sub,
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('sales')
  @Roles('PARTNER' as any)
  @ApiOperation({ summary: 'Yeni satış kaydı oluştur' })
  async createSale(@CurrentUser() user: any, @Body() dto: CreateSaleDto) {
    return this.partnerService.createSale(user.sub, dto);
  }

  @Put('profile')
  @Roles('PARTNER' as any)
  @ApiOperation({ summary: 'Partner profili güncelle' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdatePartnerProfileDto,
  ) {
    return this.partnerService.updateProfile(user.sub, dto);
  }

  // ============================================
  // ADMIN ENDPOINTS — Partner Yönetimi
  // ============================================

  @Get('admin/list')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Tüm partnerları listele (harita için)' })
  async getAllPartners() {
    return this.partnerService.getAllPartners();
  }

  @Get('admin/sales-map')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Satış haritası — koordinatlı tüm satışlar' })
  async getSalesMap(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.partnerService.getSalesMap(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('admin/regional-performance')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Admin: Bölgesel performans analizi' })
  async getRegionalPerformance() {
    return this.partnerService.getRegionalPerformance();
  }
}
