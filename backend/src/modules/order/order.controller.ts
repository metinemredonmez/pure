import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { PaginationDto } from '../../common/pipes/pagination.pipe';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

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
}
