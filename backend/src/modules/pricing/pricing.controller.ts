import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PriceChannel, UserRole } from '@prisma/client';
import {
  UpdateVolumeDiscountDto,
  SetProductPriceDto,
  SetCustomerPriceDto,
  CreateVolumeDiscountDto,
} from './dto/pricing.dto';

@ApiTags('Pricing')
@Controller()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // ══════════════════════════════════════════════
  // PUBLIC: Fiyat Hesaplama
  // ══════════════════════════════════════════════

  @Public()
  @Get('products/:productId/price')
  @ApiOperation({ summary: 'Calculate price for product' })
  @ApiQuery({ name: 'variantId', required: false })
  @ApiQuery({ name: 'quantity', required: false })
  calculatePrice(
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
    @Query('quantity') quantity?: number,
  ) {
    return this.pricingService.calculatePrice(
      productId,
      variantId || null,
      quantity || 1,
    );
  }

  @ApiBearerAuth('access-token')
  @Get('products/:productId/my-price')
  @ApiOperation({ summary: 'Calculate my personalized price' })
  @ApiQuery({ name: 'variantId', required: false })
  @ApiQuery({ name: 'quantity', required: false })
  calculateMyPrice(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('variantId') variantId?: string,
    @Query('quantity') quantity?: number,
  ) {
    return this.pricingService.calculatePrice(
      productId,
      variantId || null,
      quantity || 1,
      userId,
      role,
    );
  }

  // ══════════════════════════════════════════════
  // ADMIN: Kanal Bazlı Fiyat Yönetimi
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/products/:productId/prices')
  @ApiOperation({ summary: 'Admin: Get all channel prices for product' })
  getProductPrices(@Param('productId') productId: string) {
    return this.pricingService.getProductPrices(productId);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/products/:productId/prices')
  @ApiOperation({ summary: 'Admin: Set channel price' })
  setProductPrice(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SetProductPriceDto,
  ) {
    return this.pricingService.setProductPrice(
      productId,
      {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
      userId,
    );
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/prices/:id')
  @ApiOperation({ summary: 'Admin: Delete price' })
  deleteProductPrice(@Param('id') priceId: string) {
    return this.pricingService.deleteProductPrice(priceId);
  }

  // ══════════════════════════════════════════════
  // ADMIN: B2B Müşteri Özel Fiyat
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/customers/:customerId/prices')
  @ApiOperation({ summary: 'Admin: Get customer special prices' })
  getCustomerPrices(@Param('customerId') customerId: string) {
    return this.pricingService.getCustomerPrices(customerId);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Post('admin/customers/:customerId/prices')
  @ApiOperation({ summary: 'Admin: Set customer special price' })
  setCustomerPrice(
    @Param('customerId') customerId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SetCustomerPriceDto,
  ) {
    return this.pricingService.setCustomerPrice(
      customerId,
      {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
      userId,
    );
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Delete('admin/customer-prices/:id')
  @ApiOperation({ summary: 'Admin: Delete customer price' })
  deleteCustomerPrice(@Param('id') priceId: string) {
    return this.pricingService.deleteCustomerPrice(priceId);
  }

  // ══════════════════════════════════════════════
  // ADMIN: Toplu Alım İndirimleri
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/volume-discounts')
  @ApiOperation({ summary: 'Admin: Get volume discounts' })
  @ApiQuery({ name: 'channel', required: false })
  getVolumeDiscounts(@Query('channel') channel?: PriceChannel) {
    return this.pricingService.getVolumeDiscounts(channel);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/volume-discounts')
  @ApiOperation({ summary: 'Admin: Create volume discount' })
  createVolumeDiscount(@Body() dto: CreateVolumeDiscountDto) {
    return this.pricingService.setVolumeDiscount(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/volume-discounts/:id')
  @ApiOperation({ summary: 'Admin: Update volume discount' })
  updateVolumeDiscount(
    @Param('id') id: string,
    @Body() dto: UpdateVolumeDiscountDto,
  ) {
    return this.pricingService.updateVolumeDiscount(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/volume-discounts/:id')
  @ApiOperation({ summary: 'Admin: Delete volume discount' })
  deleteVolumeDiscount(@Param('id') id: string) {
    return this.pricingService.deleteVolumeDiscount(id);
  }

  // ══════════════════════════════════════════════
  // ADMIN: Fiyat Geçmişi
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/products/:productId/price-history')
  @ApiOperation({ summary: 'Admin: Get price change history' })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getPriceHistory(
    @Param('productId') productId: string,
    @Query('channel') channel?: PriceChannel,
    @Query('limit') limit?: number,
  ) {
    return this.pricingService.getPriceHistory(productId, { channel, limit });
  }

  // ══════════════════════════════════════════════
  // PARTNER: Kendi Fiyatlarını Görme
  // ══════════════════════════════════════════════

  @ApiBearerAuth('access-token')
  @Roles(UserRole.PARTNER)
  @Get('partner/products/:productId/price')
  @ApiOperation({ summary: 'Partner: Get my cost and margin' })
  @ApiQuery({ name: 'variantId', required: false })
  getPartnerPrice(
    @Param('productId') productId: string,
    @CurrentUser('id') partnerId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.pricingService.getPartnerPrice(
      productId,
      variantId || null,
      partnerId,
    );
  }
}
