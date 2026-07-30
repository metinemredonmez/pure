import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { PaginationDto } from '../../common/pipes/pagination.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateOrderDto,
  CreateGuestOrderDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ── Public tracking (no auth) ──

  @Public()
  @Get('orders/track')
  @ApiOperation({ summary: 'Public order tracking by orderNumber + email' })
  trackOrder(
    @Query('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    return this.orderService.trackPublic(orderNumber, email);
  }

  // ── Guest checkout (no auth) ──

  @Public()
  @Post('public/checkout/guest')
  @ApiOperation({ summary: 'Üyeliksiz sipariş + PayTR oturumu (misafir)' })
  createGuest(@Body() dto: CreateGuestOrderDto, @Req() req: any) {
    const forwardedFor = String(req.headers?.['x-forwarded-for'] || '')
      .split(',')[0]
      .trim();
    const userIp = forwardedFor || req.ip || req.socket?.remoteAddress;
    return this.orderService.createGuestCheckout(dto, userIp);
  }

  // ── Customer endpoints ──

  @Post('orders')
  @ApiOperation({ summary: 'Create order from cart' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.create(userId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List my orders' })
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.orderService.findUserOrders(userId, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.orderService.findByIdForUser(id, userId);
  }

  // ── Admin endpoints ──

  @Roles(UserRole.ADMIN)
  @Get('admin/orders')
  @ApiOperation({ summary: 'List all orders (admin)' })
  findAll(@Query() query: PaginationDto) {
    return this.orderService.findAll(query);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin/orders/:id')
  @ApiOperation({ summary: 'Get order details (admin - bypasses ownership)' })
  findOneAdmin(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch('admin/orders/:id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto.status, adminId, dto.note);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin/orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel order (admin) — kargo sürecinde engellenir' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { reason?: string },
  ) {
    return this.orderService.cancel(id, adminId, body?.reason);
  }

  @Roles(UserRole.ADMIN)
  @Delete('admin/orders/:id')
  @ApiOperation({ summary: 'Delete order (admin)' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
