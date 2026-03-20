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

  /**
   * Secure update with ownership check
   */
  async updateItemQuantitySecure(
    itemId: string,
    quantity: number,
    userId: string | null,
    sessionId: string | null,
  ) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Sepet öğesi bulunamadı');

    // Verify ownership
    const isOwner =
      (userId && item.cart.userId === userId) ||
      (sessionId && item.cart.sessionId === sessionId);
    if (!isOwner) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    return this.updateItemQuantity(itemId, quantity);
  }

  /**
   * Secure remove with ownership check
   */
  async removeItemSecure(
    itemId: string,
    userId: string | null,
    sessionId: string | null,
  ) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Sepet öğesi bulunamadı');

    // Verify ownership
    const isOwner =
      (userId && item.cart.userId === userId) ||
      (sessionId && item.cart.sessionId === sessionId);
    if (!isOwner) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    return this.removeItem(itemId);
  }

  async clearCart(userId?: string | null, sessionId?: string | null) {
    const cart = await this.getCart(userId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
  }

  // Merge guest cart into user cart after login
  async mergeCarts(userId: string, sessionId: string) {
    await this.prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findFirst({
        where: { sessionId },
        include: { items: true },
      });
      if (!guestCart || guestCart.items.length === 0) return;

      let userCart = await tx.cart.findFirst({
        where: { userId },
        include: { items: true },
      });
      if (!userCart) {
        userCart = await tx.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      for (const item of guestCart.items) {
        const existing = userCart.items.find(
          (i) =>
            i.productId === item.productId && i.variantId === item.variantId,
        );

        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }
      }

      // Delete guest cart items first (FK constraint), then cart
      await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      await tx.cart.delete({ where: { id: guestCart.id } });
    });
  }
}
