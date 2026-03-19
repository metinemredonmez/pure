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
    @Body() body: { productId: string; variantId?: string; quantity?: number },
  ) {
    return this.cartService.addItem(
      userId || null,
      sessionId || null,
      body.productId,
      body.variantId,
      body.quantity,
    );
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItemQuantity(id, body.quantity);
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @ApiBearerAuth('access-token')
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart after login' })
  mergeCarts(
    @CurrentUser('id') userId: string,
    @Body() body: { sessionId: string },
  ) {
    return this.cartService.mergeCarts(userId, body.sessionId);
  }
}
