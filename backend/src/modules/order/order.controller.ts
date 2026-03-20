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
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ── Customer endpoints ──

  @Post('orders')
  @ApiOperation({ summary: 'Create order from cart' })
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { addressId: string; couponCode?: string; note?: string },
  ) {
    return this.orderService.create(userId, body);
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
  findOne(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  // ── Admin endpoints ──

  @Roles(UserRole.ADMIN)
  @Get('admin/orders')
  @ApiOperation({ summary: 'List all orders (admin)' })
  findAll(@Query() query: PaginationDto) {
    return this.orderService.findAll(query);
  }

  @Roles(UserRole.ADMIN)
  @Patch('admin/orders/:id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    return this.orderService.updateStatus(id, body.status, adminId, body.note);
  }
}
