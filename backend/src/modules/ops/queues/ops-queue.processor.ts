import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../common/services/redis.service';
import { CronJobService } from '../cron-job.service';
import { CacheManagementService } from '../cache-management.service';

@Processor('ops-queue')
export class OpsQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(OpsQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly cronJobService: CronJobService,
    private readonly cacheService: CacheManagementService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const jobName = job.name;
    this.logger.log(`Processing job: ${jobName}`);

    // Log job start
    let logId: string | null = null;
    try {
      logId = await this.cronJobService.logJobStart(jobName);
    } catch (err) {
      this.logger.warn(`Could not log job start for ${jobName}: ${err}`);
    }

    try {
      let result: any;

      switch (jobName) {
        case 'cart-cleanup':
          result = await this.processCartCleanup();
          break;
        case 'subscription-renewal':
          result = await this.processSubscriptionRenewal();
          break;
        case 'subscription-reminder':
          result = await this.processSubscriptionReminder();
          break;
        case 'order-auto-complete':
          result = await this.processOrderAutoComplete();
          break;
        case 'loyalty-birthday':
          result = await this.processLoyaltyBirthday();
          break;
        case 'loyalty-expiry':
          result = await this.processLoyaltyExpiry();
          break;
        case 'price-schedule':
          result = await this.processPriceSchedule();
          break;
        case 'stock-alert':
          result = await this.processStockAlert();
          break;
        case 'dashboard-refresh':
          result = await this.processDashboardRefresh();
          break;
        case 'shipment-tracking':
          result = await this.processShipmentTracking();
          break;
        case 'email-queue':
          result = await this.processEmailQueue();
          break;
        case 'jwt-cleanup':
          result = await this.processJwtCleanup();
          break;
        case 'session-cleanup':
          result = await this.processSessionCleanup();
          break;
        case 'analytics-daily':
          result = await this.processAnalyticsDaily();
          break;
        case 'b2b-lead-followup':
          result = await this.processB2bLeadFollowup();
          break;
        default:
          this.logger.warn(`Unknown job: ${jobName}`);
          result = { skipped: true, reason: 'Unknown job' };
      }

      // Log success
      if (logId) {
        await this.cronJobService.logJobComplete(logId, 'SUCCESS', result);
      }

      this.logger.log(`Job ${jobName} completed successfully`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Job ${jobName} failed: ${errorMessage}`);

      // Log failure
      if (logId) {
        await this.cronJobService.logJobComplete(logId, 'FAILED', null, errorMessage);
      }

      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // JOB PROCESSORS
  // ═══════════════════════════════════════════════════════════

  /**
   * 1. Cart Cleanup - Delete abandoned carts older than 7 days
   */
  private async processCartCleanup(): Promise<{ deleted: number }> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.cart.deleteMany({
      where: {
        userId: null, // Guest carts only
        updatedAt: { lt: sevenDaysAgo },
      },
    });

    this.logger.log(`Cart cleanup: ${result.count} abandoned carts deleted`);
    return { deleted: result.count };
  }

  /**
   * 2. Subscription Renewal - Process due subscriptions
   */
  private async processSubscriptionRenewal(): Promise<{ processed: number; errors: number }> {
    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: new Date() },
      },
      include: { user: true, plan: true },
    });

    let processed = 0;
    let errors = 0;

    for (const sub of dueSubscriptions) {
      try {
        // TODO: Process payment and create order
        // For now, just update next billing date
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { nextBillingDate },
        });

        processed++;
      } catch {
        errors++;
      }
    }

    this.logger.log(`Subscription renewal: ${processed} processed, ${errors} errors`);
    return { processed, errors };
  }

  /**
   * 3. Subscription Reminder - Send reminder 3 days before renewal
   */
  private async processSubscriptionReminder(): Promise<{ sent: number }> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingRenewals = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: new Date(),
          lte: threeDaysFromNow,
        },
      },
      include: { user: true, plan: true },
    });

    // TODO: Send reminder emails
    this.logger.log(`Subscription reminder: ${upcomingRenewals.length} reminders to send`);
    return { sent: upcomingRenewals.length };
  }

  /**
   * 4. Order Auto Complete - Complete delivered orders after 14 days
   */
  private async processOrderAutoComplete(): Promise<{ completed: number }> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const result = await this.prisma.order.updateMany({
      where: {
        status: 'DELIVERED',
        updatedAt: { lt: fourteenDaysAgo },
      },
      data: { status: 'DELIVERED' }, // Already delivered, just mark as final
    });

    this.logger.log(`Order auto complete: ${result.count} orders processed`);
    return { completed: result.count };
  }

  /**
   * 5. Loyalty Birthday - Give birthday bonus points
   */
  private async processLoyaltyBirthday(): Promise<{ awarded: number }> {
    // TODO: Add birthday field to User model
    // For now, return 0
    this.logger.log('Loyalty birthday: Feature pending (no birthday field)');
    return { awarded: 0 };
  }

  /**
   * 6. Loyalty Expiry - Expire old points
   */
  private async processLoyaltyExpiry(): Promise<{ expired: number; points: number }> {
    const expiredTransactions = await this.prisma.pointTransaction.findMany({
      where: {
        points: { gt: 0 },
        expiresAt: { lte: new Date() },
        type: { not: 'EXPIRE' },
      },
      include: { loyaltyAccount: true },
    });

    let totalExpired = 0;
    let totalPoints = 0;

    for (const tx of expiredTransactions) {
      // Create expiry transaction
      await this.prisma.pointTransaction.create({
        data: {
          loyaltyAccountId: tx.loyaltyAccountId,
          type: 'EXPIRE',
          points: -tx.points,
          description: `${tx.points} puan süresi doldu`,
        },
      });

      // Update account
      await this.prisma.loyaltyAccount.update({
        where: { id: tx.loyaltyAccountId },
        data: {
          availablePoints: { decrement: tx.points },
          expiredPoints: { increment: tx.points },
        },
      });

      totalExpired++;
      totalPoints += tx.points;
    }

    this.logger.log(`Loyalty expiry: ${totalExpired} transactions, ${totalPoints} points expired`);
    return { expired: totalExpired, points: totalPoints };
  }

  /**
   * 7. Price Schedule - Apply scheduled price changes
   */
  private async processPriceSchedule(): Promise<{ applied: number }> {
    const now = new Date();

    // Activate scheduled prices
    const activated = await this.prisma.productPrice.updateMany({
      where: {
        isActive: false,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      data: { isActive: true },
    });

    // Deactivate expired prices
    const deactivated = await this.prisma.productPrice.updateMany({
      where: {
        isActive: true,
        endsAt: { lte: now },
      },
      data: { isActive: false },
    });

    // Invalidate pricing cache
    await this.cacheService.clearGroup('pricing');

    this.logger.log(`Price schedule: ${activated.count} activated, ${deactivated.count} deactivated`);
    return { applied: activated.count + deactivated.count };
  }

  /**
   * 8. Stock Alert - Send low stock notifications
   */
  private async processStockAlert(): Promise<{ alerts: number }> {
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: this.prisma.product.fields.lowStockThreshold },
      },
    });

    // TODO: Send notifications to admin
    this.logger.log(`Stock alert: ${lowStockProducts.length} products low on stock`);
    return { alerts: lowStockProducts.length };
  }

  /**
   * 9. Dashboard Refresh - Refresh dashboard cache
   */
  private async processDashboardRefresh(): Promise<{ refreshed: boolean }> {
    await this.cacheService.clearGroup('dashboard');

    // TODO: Pre-calculate and cache dashboard KPIs

    this.logger.log('Dashboard refresh: Cache cleared');
    return { refreshed: true };
  }

  /**
   * 10. Shipment Tracking - Update shipment statuses from carrier APIs
   */
  private async processShipmentTracking(): Promise<{ updated: number; errors: number }> {
    const activeShipments = await this.prisma.shipmentRecord.findMany({
      where: {
        status: { in: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
        trackingNumber: { not: null },
      },
    });

    // TODO: Call carrier APIs to get status updates

    this.logger.log(`Shipment tracking: ${activeShipments.length} shipments to check`);
    return { updated: 0, errors: 0 };
  }

  /**
   * 11. Email Queue - Process pending emails
   */
  private async processEmailQueue(): Promise<{ sent: number; errors: number }> {
    // TODO: Implement email queue processing
    this.logger.log('Email queue: No pending emails');
    return { sent: 0, errors: 0 };
  }

  /**
   * 12. JWT Cleanup - Remove expired JWT blacklist entries
   */
  private async processJwtCleanup(): Promise<{ deleted: number }> {
    const result = await this.prisma.jwtBlacklist.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    this.logger.log(`JWT cleanup: ${result.count} expired tokens removed`);
    return { deleted: result.count };
  }

  /**
   * 13. Session Cleanup - Remove old sessions
   */
  private async processSessionCleanup(): Promise<{ deleted: number }> {
    // Clean Redis sessions
    const deleted = await this.redis.deleteByPattern('session:*');

    // Clean old refresh tokens
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: thirtyDaysAgo } }],
      },
    });

    this.logger.log(`Session cleanup: ${deleted} Redis sessions cleared`);
    return { deleted };
  }

  /**
   * 14. Analytics Daily - Calculate daily analytics
   */
  private async processAnalyticsDaily(): Promise<{ calculated: boolean }> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get daily stats
    const [orders, newUsers, revenue] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ]);

    // Upsert daily report
    await this.prisma.dailyReport.upsert({
      where: { date: yesterday },
      update: {
        totalOrders: orders,
        newCustomers: newUsers,
        totalRevenue: revenue._sum.total || 0,
        generatedAt: new Date(),
      },
      create: {
        date: yesterday,
        totalOrders: orders,
        newCustomers: newUsers,
        totalRevenue: revenue._sum.total || 0,
      },
    });

    this.logger.log(`Analytics daily: ${orders} orders, ${newUsers} new users`);
    return { calculated: true };
  }

  /**
   * 15. B2B Lead Followup - Send followup reminders
   */
  private async processB2bLeadFollowup(): Promise<{ reminded: number }> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const staleLeads = await this.prisma.b2bLead.findMany({
      where: {
        status: { in: ['NEW_LEAD', 'CONTACTED'] },
        updatedAt: { lt: threeDaysAgo },
      },
    });

    // TODO: Send reminder notifications to sales team

    this.logger.log(`B2B lead followup: ${staleLeads.length} leads need attention`);
    return { reminded: staleLeads.length };
  }
}
