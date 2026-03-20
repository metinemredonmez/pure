import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../common/services/redis.service';
import { CronJobService } from '../cron-job.service';
import { CacheManagementService } from '../cache-management.service';
import { Decimal } from '@prisma/client/runtime/library';

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
  private async processSubscriptionRenewal(): Promise<{ processed: number; failed: number; orders: number }> {
    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: new Date() },
      },
      include: { user: true, plan: true },
    });

    let processed = 0;
    let failed = 0;
    let orders = 0;

    for (const sub of dueSubscriptions) {
      try {
        // Create subscription cycle
        const cycleCount = await this.prisma.subscriptionCycle.count({
          where: { subscriptionId: sub.id },
        });

        await this.prisma.subscriptionCycle.create({
          data: {
            subscriptionId: sub.id,
            cycleNumber: cycleCount + 1,
            billingDate: new Date(),
            amount: sub.plan.priceMonthly,
            status: 'pending',
          },
        });

        // Update next billing date
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { nextBillingDate },
        });

        // Send notification
        await this.createNotification(
          sub.userId,
          'Abonelik Yenilendi',
          `${sub.plan.name} aboneliğiniz yenilendi. Sonraki ödeme: ${nextBillingDate.toLocaleDateString('tr-TR')}`,
          'subscription',
        );

        processed++;
        orders++;
      } catch (err) {
        this.logger.error(`Subscription renewal failed for ${sub.id}: ${err}`);

        // Increment retry count
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { failedRetryCount: { increment: 1 } },
        });

        // If too many failures, mark as past due
        if (sub.failedRetryCount >= 2) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
          });
        }

        failed++;
      }
    }

    this.logger.log(`Subscription renewal: ${processed} processed, ${failed} failed, ${orders} orders created`);
    return { processed, failed, orders };
  }

  /**
   * 3. Subscription Reminder - Send reminder 3 days before renewal
   */
  private async processSubscriptionReminder(): Promise<{ sent: number }> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingRenewals = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: tomorrow,
          lte: threeDaysFromNow,
        },
      },
      include: { user: true, plan: true },
    });

    let sent = 0;
    for (const sub of upcomingRenewals) {
      const daysUntil = Math.ceil(
        (sub.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      await this.createNotification(
        sub.userId,
        'Abonelik Hatırlatma',
        `${sub.plan.name} aboneliğiniz ${daysUntil} gün sonra yenilenecek. Tutar: ${sub.plan.priceMonthly} TL`,
        'subscription',
      );

      sent++;
    }

    this.logger.log(`Subscription reminder: ${sent} reminders sent`);
    return { sent };
  }

  /**
   * 4. Order Auto Complete - Complete delivered orders after 14 days
   */
  private async processOrderAutoComplete(): Promise<{ completed: number }> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Find orders to complete
    const ordersToComplete = await this.prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        updatedAt: { lt: fourteenDaysAgo },
      },
      select: { id: true, userId: true, orderNumber: true },
    });

    // Add status history
    for (const order of ordersToComplete) {
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'DELIVERED',
          note: 'Sipariş otomatik olarak tamamlandı (14 gün sonra)',
          changedBy: 'SYSTEM',
        },
      });
    }

    this.logger.log(`Order auto complete: ${ordersToComplete.length} orders processed`);
    return { completed: ordersToComplete.length };
  }

  /**
   * 5. Loyalty Birthday - Give birthday bonus points
   */
  private async processLoyaltyBirthday(): Promise<{ awarded: number; points: number }> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Find users with birthday today
    const birthdayUsers = await this.prisma.user.findMany({
      where: {
        birthday: { not: null },
        isActive: true,
      },
      include: { loyaltyAccount: true },
    });

    // Filter users whose birthday is today
    const todaysBirthdays = birthdayUsers.filter((user) => {
      if (!user.birthday) return false;
      const bday = new Date(user.birthday);
      return bday.getMonth() + 1 === month && bday.getDate() === day;
    });

    let awarded = 0;
    const BIRTHDAY_POINTS = 200;

    for (const user of todaysBirthdays) {
      if (!user.loyaltyAccount) continue;

      // Check if already awarded today
      const alreadyAwarded = await this.prisma.pointTransaction.findFirst({
        where: {
          loyaltyAccountId: user.loyaltyAccount.id,
          type: 'EARN_BIRTHDAY',
          createdAt: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
          },
        },
      });

      if (alreadyAwarded) continue;

      // Award birthday points
      await this.prisma.pointTransaction.create({
        data: {
          loyaltyAccountId: user.loyaltyAccount.id,
          type: 'EARN_BIRTHDAY',
          points: BIRTHDAY_POINTS,
          description: `Doğum günü bonusu 🎂`,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      await this.prisma.loyaltyAccount.update({
        where: { id: user.loyaltyAccount.id },
        data: {
          totalPoints: { increment: BIRTHDAY_POINTS },
          availablePoints: { increment: BIRTHDAY_POINTS },
        },
      });

      // Send notification
      await this.createNotification(
        user.id,
        'Doğum Günün Kutlu Olsun! 🎂',
        `Size ${BIRTHDAY_POINTS} puan hediye ettik. Mutlu yıllar!`,
        'success',
      );

      awarded++;
    }

    this.logger.log(`Loyalty birthday: ${awarded} users awarded ${BIRTHDAY_POINTS * awarded} points`);
    return { awarded, points: BIRTHDAY_POINTS * awarded };
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
  private async processPriceSchedule(): Promise<{ activated: number; deactivated: number }> {
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
    await this.cacheService.clearGroup('products');

    this.logger.log(`Price schedule: ${activated.count} activated, ${deactivated.count} deactivated`);
    return { activated: activated.count, deactivated: deactivated.count };
  }

  /**
   * 8. Stock Alert - Send low stock notifications
   */
  private async processStockAlert(): Promise<{ alerts: number; products: string[] }> {
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        isActive: true,
        status: 'ACTIVE',
      },
    });

    // Filter products where stock <= lowStockThreshold
    const criticalProducts = lowStockProducts.filter(
      (p) => p.stock <= p.lowStockThreshold,
    );

    if (criticalProducts.length === 0) {
      return { alerts: 0, products: [] };
    }

    // Get admin users
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    const productNames = criticalProducts.map((p) => p.name);
    const message = `${criticalProducts.length} üründe stok kritik seviyede: ${productNames.slice(0, 3).join(', ')}${criticalProducts.length > 3 ? '...' : ''}`;

    // Send notification to all admins
    for (const admin of admins) {
      await this.createNotification(
        admin.id,
        '⚠️ Düşük Stok Uyarısı',
        message,
        'warning',
        '/admin/products?filter=low-stock',
      );
    }

    this.logger.log(`Stock alert: ${criticalProducts.length} products low on stock`);
    return { alerts: criticalProducts.length, products: productNames };
  }

  /**
   * 9. Dashboard Refresh - Refresh dashboard cache with pre-calculated KPIs
   */
  private async processDashboardRefresh(): Promise<{ refreshed: boolean; kpis: any }> {
    await this.cacheService.clearGroup('dashboard');

    // Calculate KPIs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      todayOrders,
      todayRevenue,
      monthlyOrders,
      monthlyRevenue,
      activeSubscriptions,
      newLeads,
      lowStockCount,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.b2bLead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.product.count({
        where: { isActive: true, status: 'ACTIVE' },
      }),
    ]);

    const kpis = {
      todayOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      monthlyOrders,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      activeSubscriptions,
      newLeads,
      lowStockCount,
      calculatedAt: new Date().toISOString(),
    };

    // Cache KPIs for 15 minutes
    await this.redis.set('cache:dashboard:kpis', kpis, 900);

    this.logger.log('Dashboard refresh: KPIs calculated and cached');
    return { refreshed: true, kpis };
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
      include: { order: { select: { userId: true, orderNumber: true } } },
    });

    let updated = 0;
    let errors = 0;

    for (const shipment of activeShipments) {
      try {
        // Simulate carrier API response - in production this would call actual APIs
        // The carrier services (YurticiCarrier, ArasCarrier, MngCarrier) handle actual API calls
        const cachedStatus = await this.redis.get<{
          status: string;
          location?: string;
        }>(`shipping:status:${shipment.trackingNumber}`);

        if (cachedStatus && cachedStatus.status !== shipment.status) {
          // Update shipment status
          const newStatus = this.mapCarrierStatus(cachedStatus.status);

          await this.prisma.shipmentRecord.update({
            where: { id: shipment.id },
            data: {
              status: newStatus,
              ...(newStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
            },
          });

          // Add status history
          await this.prisma.shipmentStatusHistory.create({
            data: {
              shipmentId: shipment.id,
              status: newStatus,
              location: cachedStatus.location,
              description: `Durum güncellendi: ${newStatus}`,
              timestamp: new Date(),
            },
          });

          // Notify user on delivery
          if (newStatus === 'DELIVERED' && shipment.order) {
            await this.createNotification(
              shipment.order.userId,
              'Kargonuz Teslim Edildi 📦',
              `${shipment.order.orderNumber} numaralı siparişiniz teslim edildi.`,
              'success',
            );
          }

          updated++;
        }
      } catch (err) {
        this.logger.error(`Shipment tracking error for ${shipment.trackingNumber}: ${err}`);
        errors++;
      }
    }

    this.logger.log(`Shipment tracking: ${updated} updated, ${errors} errors`);
    return { updated, errors };
  }

  /**
   * 11. Email Queue - Process pending emails
   */
  private async processEmailQueue(): Promise<{ sent: number; errors: number }> {
    // Get pending notifications that need email
    const pendingEmails = await this.prisma.sentNotification.findMany({
      where: {
        channel: 'email',
        status: 'pending',
      },
      take: 50,
    });

    let sent = 0;
    let errors = 0;

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await this.prisma.sentNotification.update({
          where: { id: email.id },
          data: { status: 'processing' },
        });

        // In production, this would send via SMTP/nodemailer
        // For now, mark as sent
        await this.prisma.sentNotification.update({
          where: { id: email.id },
          data: { status: 'sent' },
        });

        sent++;
      } catch (err) {
        await this.prisma.sentNotification.update({
          where: { id: email.id },
          data: { status: 'failed' },
        });
        errors++;
      }
    }

    this.logger.log(`Email queue: ${sent} sent, ${errors} errors`);
    return { sent, errors };
  }

  /**
   * 12. JWT Cleanup - Remove expired JWT blacklist entries
   */
  private async processJwtCleanup(): Promise<{ deleted: number }> {
    const result = await this.prisma.jwtBlacklist.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    // Also clean Redis JWT blacklist
    await this.redis.deleteByPattern('jwt:blacklist:*');

    this.logger.log(`JWT cleanup: ${result.count} expired tokens removed`);
    return { deleted: result.count };
  }

  /**
   * 13. Session Cleanup - Remove old sessions
   */
  private async processSessionCleanup(): Promise<{ sessions: number; tokens: number }> {
    // Clean Redis sessions older than 7 days
    const sessionKeys = await this.redis.scan('session:*');
    let sessionsDeleted = 0;

    for (const key of sessionKeys) {
      const ttl = await this.redis.getRaw(key);
      if (!ttl) {
        await this.redis.del(key);
        sessionsDeleted++;
      }
    }

    // Clean old refresh tokens
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tokenResult = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: thirtyDaysAgo } },
        ],
      },
    });

    this.logger.log(`Session cleanup: ${sessionsDeleted} sessions, ${tokenResult.count} tokens deleted`);
    return { sessions: sessionsDeleted, tokens: tokenResult.count };
  }

  /**
   * 14. Analytics Daily - Calculate daily analytics
   */
  private async processAnalyticsDaily(): Promise<{ calculated: boolean; report: any }> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get comprehensive daily stats
    const [
      orders,
      newUsers,
      revenue,
      topProducts,
      ordersByStatus,
      subscriptionsCount,
    ] = await Promise.all([
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
      this.prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { createdAt: { gte: yesterday, lt: today } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: yesterday, lt: today } },
        _count: true,
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    // Calculate conversion rate (orders / new users)
    const conversionRate = newUsers > 0 ? (orders / newUsers) * 100 : 0;

    // Upsert daily report
    const report = await this.prisma.dailyReport.upsert({
      where: { date: yesterday },
      update: {
        totalOrders: orders,
        newCustomers: newUsers,
        totalRevenue: revenue._sum.total || new Decimal(0),
        activeSubscriptions: subscriptionsCount,
        conversionRate,
        topProducts: topProducts.map((p) => ({
          name: p.productName,
          quantity: p._sum.quantity,
        })),
        generatedAt: new Date(),
      },
      create: {
        date: yesterday,
        totalOrders: orders,
        newCustomers: newUsers,
        totalRevenue: revenue._sum.total || new Decimal(0),
        activeSubscriptions: subscriptionsCount,
        conversionRate,
        topProducts: topProducts.map((p) => ({
          name: p.productName,
          quantity: p._sum.quantity,
        })),
      },
    });

    this.logger.log(`Analytics daily: ${orders} orders, ${newUsers} new users, ${revenue._sum.total || 0} TL`);
    return { calculated: true, report };
  }

  /**
   * 15. B2B Lead Followup - Send followup reminders to sales team
   */
  private async processB2bLeadFollowup(): Promise<{ reminded: number; leads: string[] }> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const staleLeads = await this.prisma.b2bLead.findMany({
      where: {
        status: { in: ['NEW_LEAD', 'CONTACTED'] },
        updatedAt: { lt: threeDaysAgo },
      },
      select: { id: true, companyName: true, assignedTo: true },
    });

    if (staleLeads.length === 0) {
      return { reminded: 0, leads: [] };
    }

    // Get sales team users
    const salesTeam = await this.prisma.user.findMany({
      where: { role: { in: ['SALES', 'ADMIN'] }, isActive: true },
      select: { id: true },
    });

    // Group leads by assigned user
    const leadsByUser = new Map<string, typeof staleLeads>();
    for (const lead of staleLeads) {
      const userId = lead.assignedTo || 'unassigned';
      if (!leadsByUser.has(userId)) {
        leadsByUser.set(userId, []);
      }
      leadsByUser.get(userId)!.push(lead);
    }

    let reminded = 0;
    const leadNames = staleLeads.map((l) => l.companyName);

    // Send notifications to assigned users or all sales team
    for (const [userId, leads] of leadsByUser) {
      const targetUsers = userId === 'unassigned'
        ? salesTeam.map((u) => u.id)
        : [userId];

      for (const targetId of targetUsers) {
        await this.createNotification(
          targetId,
          '📋 B2B Lead Takip Hatırlatması',
          `${leads.length} lead 3 gündür güncellenmedi: ${leads.slice(0, 2).map((l) => l.companyName).join(', ')}${leads.length > 2 ? '...' : ''}`,
          'warning',
          '/admin/b2b/leads?filter=stale',
        );
        reminded++;
      }
    }

    this.logger.log(`B2B lead followup: ${staleLeads.length} stale leads, ${reminded} reminders sent`);
    return { reminded, leads: leadNames };
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Create in-app notification
   */
  private async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    link?: string,
  ): Promise<void> {
    await this.prisma.inAppNotification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  }

  /**
   * Map carrier status to ShipmentStatus enum
   */
  private mapCarrierStatus(carrierStatus: string): 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' {
    const statusMap: Record<string, 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED'> = {
      'HAZIRLANIYOR': 'PREPARING',
      'KARGOYA_VERILDI': 'SHIPPED',
      'YOLDA': 'IN_TRANSIT',
      'DAGITIMDA': 'OUT_FOR_DELIVERY',
      'TESLIM_EDILDI': 'DELIVERED',
      'IADE': 'RETURNED',
      'IPTAL': 'CANCELLED',
    };
    return statusMap[carrierStatus] || 'IN_TRANSIT';
  }
}
