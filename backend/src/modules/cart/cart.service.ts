import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId?: string | null, sessionId?: string | null) {
    const where: any = userId ? { userId } : { sessionId };
    let cart = await this.prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, sessionId },
        include: {
          items: {
            include: {
              product: { include: { images: { take: 1 } } },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(
    userId: string | null | undefined,
    sessionId: string | null | undefined,
    productId: string,
    variantId?: string,
    quantity: number = 1,
  ) {
    const cart = await this.getCart(userId, sessionId);

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true, variant: true },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
      include: { product: true, variant: true },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { message: 'Item removed' };
    }
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true, variant: true },
    });
  }

  async removeItem(itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  async clearCart(userId?: string | null, sessionId?: string | null) {
    const cart = await this.getCart(userId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
  }

  // Merge guest cart into user cart after login
  async mergeCarts(userId: string, sessionId: string) {
    const guestCart = await this.prisma.cart.findFirst({
      where: { sessionId },
      include: { items: true },
    });
    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getCart(userId);

    for (const item of guestCart.items) {
      const existing = await this.prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Delete guest cart
    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }
}
