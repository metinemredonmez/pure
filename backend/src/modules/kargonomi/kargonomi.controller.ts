import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  Headers,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { KargonomiService } from './kargonomi.service';
import {
  CreateKargonomiShipmentDto,
  UpdateKargonomiShipmentDto,
  ConfirmShippingDto,
  CancelKargonomiShipmentDto,
  KargonomiWebhookDto,
} from './dto/kargonomi.dto';

// ══════════════════════════════════════════════
// ADMIN CONTROLLER — Kargonomi Integration
// ══════════════════════════════════════════════

@ApiTags('Admin - Kargonomi Shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/kargonomi')
export class AdminKargonomiController {
  constructor(private readonly kargonomiService: KargonomiService) {}

  /** List all shipments from Kargonomi (paginated) */
  @Get('shipments')
  @ApiOperation({ summary: 'List Kargonomi shipments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async listShipments(@Query('page') page?: string) {
    return this.kargonomiService.listShipments(page ? parseInt(page, 10) : undefined);
  }

  /** Get a single shipment by ID */
  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get Kargonomi shipment by ID' })
  @ApiParam({ name: 'id', type: Number })
  async getShipment(@Param('id', ParseIntPipe) id: number) {
    return this.kargonomiService.getShipment(id);
  }

  /** Create a new draft shipment */
  @Post('shipments')
  @ApiOperation({ summary: 'Create draft shipment in Kargonomi' })
  async createShipment(@Body() dto: CreateKargonomiShipmentDto) {
    return this.kargonomiService.createShipment(dto);
  }

  /** Update an existing draft shipment */
  @Patch('shipments/:id')
  @ApiOperation({ summary: 'Update Kargonomi shipment' })
  @ApiParam({ name: 'id', type: Number })
  async updateShipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKargonomiShipmentDto,
  ) {
    return this.kargonomiService.updateShipment(id, dto);
  }

  /** Delete a draft shipment */
  @Delete('shipments/:id')
  @ApiOperation({ summary: 'Delete Kargonomi shipment' })
  @ApiParam({ name: 'id', type: Number })
  async deleteShipment(@Param('id', ParseIntPipe) id: number) {
    return this.kargonomiService.deleteShipment(id);
  }

  /** Get price comparison from multiple cargo providers */
  @Get('shipments/:id/prices')
  @ApiOperation({ summary: 'Get shipping price comparison for a shipment' })
  @ApiParam({ name: 'id', type: Number })
  async getPriceComparison(@Param('id', ParseIntPipe) id: number) {
    return this.kargonomiService.getPriceComparison(id);
  }

  /** Confirm shipping with selected provider */
  @Post('shipments/confirm')
  @ApiOperation({ summary: 'Confirm shipping with selected provider/price' })
  async confirmShipping(@Body() dto: ConfirmShippingDto) {
    return this.kargonomiService.confirmShipping(dto);
  }

  /** Cancel a shipment */
  @Post('shipments/cancel')
  @ApiOperation({ summary: 'Cancel a Kargonomi shipment' })
  async cancelShipment(@Body() dto: CancelKargonomiShipmentDto) {
    return this.kargonomiService.cancelShipment(dto);
  }

  /** Download barcode/label as PDF */
  @Get('shipments/:id/barcode')
  @ApiOperation({ summary: 'Download shipment barcode/label PDF' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'PDF file' })
  async getBarcode(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.kargonomiService.getBarcode(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="shipment-${id}-barcode.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  /** Get current Kargonomi account credit */
  @Get('credit')
  @ApiOperation({ summary: 'Get Kargonomi account credit/balance' })
  async getCredit() {
    return this.kargonomiService.getCredit();
  }

  /** Get all states (iller) for address forms */
  @Get('states')
  @ApiOperation({ summary: 'Get all states (iller)' })
  async getStates() {
    return this.kargonomiService.getStates();
  }

  /** Get cities (ilceler) for a state */
  @Get('states/:stateId/cities')
  @ApiOperation({ summary: 'Get cities for a state (ilceler)' })
  @ApiParam({ name: 'stateId', type: Number })
  async getCities(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.kargonomiService.getCities(stateId);
  }
}

// ══════════════════════════════════════════════
// PUBLIC WEBHOOK CONTROLLER — Kargonomi Callbacks
// ══════════════════════════════════════════════

@ApiTags('Webhooks - Kargonomi')
@Controller('public/kargonomi')
export class KargonomiWebhookController {
  private readonly logger = new Logger(KargonomiWebhookController.name);

  constructor(private readonly kargonomiService: KargonomiService) {}

  /**
   * Receive Kargonomi webhook events.
   * Verifies HMAC-SHA256 signature from X-Webhook-Signature header
   * before processing the payload.
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kargonomi webhook receiver' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Req() req: any,
    @Headers('x-webhook-signature') signature: string,
    @Body() body: KargonomiWebhookDto,
  ) {
    // Verify HMAC-SHA256 signature
    const rawBody = (req as any).rawBody as Buffer;
    if (!signature || !rawBody) {
      throw new BadRequestException('Missing webhook signature');
    }

    const isValid = this.kargonomiService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn('Invalid Kargonomi webhook signature received');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Kargonomi webhook received: ${body.event}`);

    // Process the webhook event
    // Extend this switch as needed for different event types
    return { success: true, event: body.event };
  }
}
