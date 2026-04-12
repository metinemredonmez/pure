import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, ListInvoicesQueryDto } from './dto/invoice.dto';

// ══════════════════════════════════════════════
// ADMIN CONTROLLER — BirFatura Invoice Integration
// ══════════════════════════════════════════════

@ApiTags('Admin - Invoices (BirFatura)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/invoices')
export class AdminInvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /** Create a new e-fatura or e-arsiv invoice via BirFatura */
  @Post()
  @ApiOperation({ summary: 'Create e-invoice / e-arsiv via BirFatura' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(dto);
  }

  /** List invoices with optional date range filter */
  @Get()
  @ApiOperation({ summary: 'List invoices from BirFatura' })
  async listInvoices(@Query() query: ListInvoicesQueryDto) {
    return this.invoiceService.listInvoices(query);
  }

  /** Get a single invoice by BirFatura ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID from BirFatura' })
  @ApiParam({ name: 'id', type: String })
  async getInvoice(@Param('id') id: string) {
    return this.invoiceService.getInvoice(id);
  }

  /** Cancel an existing invoice */
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an invoice via BirFatura' })
  @ApiParam({ name: 'id', type: String })
  async cancelInvoice(@Param('id') id: string) {
    return this.invoiceService.cancelInvoice(id);
  }
}
