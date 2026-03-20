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
import { UserRole } from '@prisma/client';
import { PartnerService } from './partner.service';
import { CreateSaleDto, UpdatePartnerProfileDto } from './dto/partner.dto';

@ApiTags('Partner Portal')
@ApiBearerAuth()
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  // ============================================
  // PARTNER OWN ENDPOINTS
  // ============================================

  @Get('dashboard')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Partner dashboard — özet metrikler' })
  async getDashboard(@CurrentUser() user: any) {
    return this.partnerService.getDashboard(user.id);
  }

  @Get('sales')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Partner satışları listele' })
  async getSales(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.partnerService.getSales(
      user.id,
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('sales')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Yeni satış kaydı oluştur' })
  async createSale(@CurrentUser() user: any, @Body() dto: CreateSaleDto) {
    return this.partnerService.createSale(user.id, dto);
  }

  @Put('profile')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Partner profili güncelle' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdatePartnerProfileDto,
  ) {
    return this.partnerService.updateProfile(user.id, dto);
  }

  // ============================================
  // ADMIN ENDPOINTS — Partner Yönetimi
  // ============================================

  @Get('admin/list')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Tüm partnerları listele' })
  async getAllPartners(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.partnerService.getAllPartners(page, limit);
  }

  @Get('admin/sales-map')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Bölgesel performans analizi' })
  async getRegionalPerformance() {
    return this.partnerService.getRegionalPerformance();
  }
}
