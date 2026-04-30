import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Public } from '../../common/decorators/public.decorator';
import { ValidateCouponDto } from './dto/admin.dto';

/**
 * Public-facing coupon endpoints — used by the web checkout to validate
 * a coupon code before placing an order.
 */
@ApiTags('Coupons (Public)')
@Controller('coupons')
export class CouponsPublicController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate coupon code (public)' })
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.adminService.validateCoupon(dto.code, dto.subtotal);
  }
}
