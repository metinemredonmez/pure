import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/pipes/pagination.pipe';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    addressId: string;
    couponCode?: string;
    note?: string;
  }) {
    // Get user cart
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: { include: { product: true, variant: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const unitPrice = item.variant
        ? Number(item.variant.price)
        : Number(item.product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant?.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    // Apply coupon if provided
    let discount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: data.couponCode },
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discount = subtotal * (Number(coupon.discountValue) / 100);
        } else {
          discount = Number(coupon.discountValue);
        }
        couponId = coupon.id;
        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const shippingCost = subtotal >= 500 ? 0 : 39.9; // Free shipping over 500 TL
    const tax = (subtotal - discount) * 0.20; // %20 KDV
    const total = subtotal - discount + shippingCost + tax;

    // Generate order number
    const count = await this.prisma.order.count();
    const orderNumber = `OLN-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId: data.addressId,
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        couponId,
        note: data.note,
        items: { create: orderItems },
        statusHistory: {
          create: { status: OrderStatus.PENDING },
        },
      },
      include: { items: true, statusHistory: true },
    });

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  }

  async findUserOrders(userId: string, query: PaginationDto): Promise<PaginatedResult<any>> {
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true, variant: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payment: true,
        address: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ── Admin ──

  async findAll(query: PaginationDto): Promise<PaginatedResult<any>> {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          payment: true,
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async updateStatus(id: string, status: OrderStatus, changedBy?: string, note?: string) {
    await this.prisma.orderStatusHistory.create({
      data: { orderId: id, status, changedBy, note },
    });

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
    });
  }
}
