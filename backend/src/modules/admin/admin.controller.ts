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
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ══════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiQuery({ name: 'days', required: false })
  getRevenueChart(@Query('days') days?: number) {
    return this.adminService.getRevenueChart(days || 30);
  }

  @Get('dashboard/top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'days', required: false })
  getTopProducts(@Query('limit') limit?: number, @Query('days') days?: number) {
    return this.adminService.getTopProducts(limit || 10, days || 30);
  }

  @Get('dashboard/recent-orders')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiQuery({ name: 'limit', required: false })
  getRecentOrders(@Query('limit') limit?: number) {
    return this.adminService.getRecentOrders(limit || 10);
  }

  @Get('dashboard/customer-insights')
  @ApiOperation({ summary: 'Get customer insights' })
  getCustomerInsights() {
    return this.adminService.getCustomerInsights();
  }

  @Get('dashboard/order-status')
  @ApiOperation({ summary: 'Get order status breakdown' })
  getOrderStatusBreakdown() {
    return this.adminService.getOrderStatusBreakdown();
  }

  @Get('dashboard/low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  getLowStockProducts() {
    return this.adminService.getLowStockProducts();
  }

  // ══════════════════════════════════════════════
  // COUPON MANAGEMENT
  // ══════════════════════════════════════════════

  @Get('coupons')
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  getCoupons(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.getCoupons({
      page,
      limit,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create coupon' })
  createCoupon(
    @Body()
    data: {
      code: string;
      description?: string;
      type: string;
      value: number;
      minOrderAmount?: number;
      maxDiscount?: number;
      maxUses?: number;
      expiresAt?: string;
    },
  ) {
    return this.adminService.createCoupon({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: 'Update coupon' })
  updateCoupon(@Param('id') id: string, @Body() data: any) {
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    return this.adminService.updateCoupon(id, data);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete coupon' })
  deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }

  @Post('coupons/validate')
  @ApiOperation({ summary: 'Validate coupon code' })
  validateCoupon(@Body() data: { code: string; subtotal: number }) {
    return this.adminService.validateCoupon(data.code, data.subtotal);
  }

  // ══════════════════════════════════════════════
  // AUDIT LOGS
  // ══════════════════════════════════════════════

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entity', required: false })
  getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
  ) {
    return this.adminService.getAuditLogs({
      page,
      limit,
      userId,
      action,
      entity,
    });
  }
}
