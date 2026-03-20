import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { WebhookHmacGuard } from '../identity/guards/api-key.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ShippingService } from './shipping.service';
import {
  CreateShipmentDto,
  CalculateShippingDto,
  UpdateShippingSettingsDto,
  WebhookDto,
} from './dto/shipping.dto';
import { ShippingCarrier } from '@prisma/client';

// ══════════════════════════════════════════════
// ADMIN CONTROLLER
// ══════════════════════════════════════════════

@ApiTags('Admin - Shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/shipping')
export class AdminShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // 1. POST /admin/shipping/create — Sipariş için kargo kaydı oluştur
  @Post('create')
  @ApiOperation({ summary: 'Create shipment for order' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto.orderId, dto.carrier);
  }

  // 2. GET /admin/shipping/orders — Kargoya verilecek siparişleri listele
  @Get('orders')
  @ApiOperation({ summary: 'List orders ready for shipping' })
  async getOrdersToShip() {
    return this.shippingService.getOrdersToShip();
  }

  // 3. PUT /admin/shipping/:orderId/ship — Siparişi kargoya ver
  @Put(':orderId/ship')
  @ApiOperation({ summary: 'Ship order (assign tracking number)' })
  async shipOrder(@Param('orderId') orderId: string) {
    return this.shippingService.shipOrder(orderId);
  }

  // 4. GET /admin/shipping/:orderId/label — Kargo etiketi PDF oluştur
  @Get(':orderId/label')
  @ApiOperation({ summary: 'Get shipping label PDF' })
  async getLabel(@Param('orderId') orderId: string) {
    return this.shippingService.getLabel(orderId);
  }

  // 5. POST /admin/shipping/:orderId/return — İade kargo kaydı oluştur
  @Post(':orderId/return')
  @ApiOperation({ summary: 'Create return shipment' })
  async createReturn(@Param('orderId') orderId: string) {
    return this.shippingService.createReturn(orderId);
  }

  // 6. GET /admin/shipping/dashboard — Kargo özet
  @Get('dashboard')
  @ApiOperation({ summary: 'Get shipping dashboard stats' })
  async getDashboard() {
    return this.shippingService.getDashboard();
  }

  // 7. PUT /admin/shipping/settings — Kargo ayarları
  @Put('settings')
  @ApiOperation({ summary: 'Update shipping settings' })
  async updateSettings(@Body() dto: UpdateShippingSettingsDto) {
    return this.shippingService.updateSettings(dto);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get shipping settings' })
  async getSettings() {
    return this.shippingService.getSettings();
  }
}

// ══════════════════════════════════════════════
// USER CONTROLLER
// ══════════════════════════════════════════════

@ApiTags('Shipping - User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class UserShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // 8. GET /orders/:orderId/tracking — Kargo takip
  @Get(':orderId/tracking')
  @ApiOperation({ summary: 'Get order tracking info' })
  async getTracking(@Param('orderId') orderId: string) {
    return this.shippingService.getTracking(orderId);
  }

  // 9. GET /orders/:orderId/tracking/live — Anlık kargo durumu
  @Get(':orderId/tracking/live')
  @ApiOperation({ summary: 'Get live tracking from carrier API' })
  async getLiveTracking(@Param('orderId') orderId: string) {
    return this.shippingService.getLiveTracking(orderId);
  }
}

// ══════════════════════════════════════════════
// WEBHOOK CONTROLLER
// ══════════════════════════════════════════════

@ApiTags('Webhooks - Shipping')
@UseGuards(WebhookHmacGuard)
@Controller('webhooks/shipping')
export class ShippingWebhookController {
  constructor(private readonly shippingService: ShippingService) {}

  // 10. POST /webhooks/shipping/yurtici — Yurtiçi durum güncellemesi
  @Post('yurtici')
  @Public()
  @ApiOperation({ summary: 'Yurtiçi Kargo webhook' })
  async yurticiWebhook(@Body() dto: WebhookDto) {
    return this.shippingService.handleWebhook(ShippingCarrier.YURTICI, dto);
  }

  // 11. POST /webhooks/shipping/aras — Aras durum güncellemesi
  @Post('aras')
  @Public()
  @ApiOperation({ summary: 'Aras Kargo webhook' })
  async arasWebhook(@Body() dto: WebhookDto) {
    return this.shippingService.handleWebhook(ShippingCarrier.ARAS, dto);
  }

  // 12. POST /webhooks/shipping/mng — MNG durum güncellemesi
  @Post('mng')
  @Public()
  @ApiOperation({ summary: 'MNG Kargo webhook' })
  async mngWebhook(@Body() dto: WebhookDto) {
    return this.shippingService.handleWebhook(ShippingCarrier.MNG, dto);
  }
}

// ══════════════════════════════════════════════
// PUBLIC CONTROLLER
// ══════════════════════════════════════════════

@ApiTags('Shipping - Public')
@Controller('shipping')
export class PublicShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // 13. POST /shipping/calculate — Dinamik kargo ücreti hesapla
  @Post('calculate')
  @Public()
  @ApiOperation({ summary: 'Calculate shipping cost' })
  @ApiResponse({
    status: 200,
    description: 'Shipping cost calculated',
    schema: {
      example: {
        cost: 25.5,
        isFree: false,
        freeShippingThreshold: 500,
        remainingForFree: 50,
        estimatedDays: 3,
        carrierPrices: [
          { carrier: 'YURTICI', cost: 25.5 },
          { carrier: 'ARAS', cost: 24.23 },
          { carrier: 'MNG', cost: 26.78 },
        ],
      },
    },
  })
  async calculateShipping(@Body() dto: CalculateShippingDto) {
    return this.shippingService.calculateShippingCost(dto);
  }
}
