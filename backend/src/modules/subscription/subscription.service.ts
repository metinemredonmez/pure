import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus, GrindType } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async subscribe(userId: string, planId: string, grindPreference?: GrindType) {
    const plan = await this.prisma.subPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (existing)
      throw new BadRequestException('Already have an active subscription');

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    return this.prisma.subscription.create({
      data: {
        userId,
        planId,
        grindPreference,
        nextBillingDate,
        cycles: {
          create: {
            cycleNumber: 1,
            billingDate: new Date(),
            amount: plan.priceMonthly,
            status: 'paid',
          },
        },
      },
      include: { plan: true, cycles: true },
    });
  }

  async pause(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.PAUSED, pausedAt: new Date() },
    });
  }

  async resume(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.ACTIVE, pausedAt: null },
    });
  }

  async cancel(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        cycles: { orderBy: { cycleNumber: 'desc' }, take: 5 },
      },
    });
  }

  // Admin
  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
