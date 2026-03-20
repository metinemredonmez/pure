import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AddCartItemDto,
  UpdateCartItemDto,
  MergeCartsDto,
} from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get cart (guest or authenticated)' })
  getCart(
    @CurrentUser('id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.getCart(userId || null, sessionId || null);
  }

  @Public()
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @CurrentUser('id') userId: string,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(
      userId || null,
      sessionId || null,
      dto.productId,
      dto.variantId,
      dto.quantity,
    );
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @CurrentUser('id') userId: string,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantitySecure(
      id,
      dto.quantity,
      userId || null,
      sessionId || null,
    );
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @CurrentUser('id') userId: string,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.cartService.removeItemSecure(
      id,
      userId || null,
      sessionId || null,
    );
  }

  @ApiBearerAuth('access-token')
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart after login' })
  mergeCarts(@CurrentUser('id') userId: string, @Body() dto: MergeCartsDto) {
    return this.cartService.mergeCarts(userId, dto.sessionId);
  }
}
