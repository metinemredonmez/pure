import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CronJobStatus } from '@prisma/client';
import { CronExpressionParser } from 'cron-parser';

// Job definitions
export interface JobDefinition {
  name: string;
  description: string;
  schedule: string; // Cron expression
  queueName: string;
  isActive: boolean;
}

export const CRON_JOBS: JobDefinition[] = [
  {
    name: 'cart-cleanup',
    description: '7 gün eski terk edilmiş sepetleri sil',
    schedule: '0 */6 * * *', // Her 6 saat
    queueName: 'cart-queue',
    isActive: true,
  },
  {
    name: 'subscription-renewal',
    description: 'Vadesi gelen abonelikleri yenile',
    schedule: '0 3 * * *', // Her gün 03:00
    queueName: 'subscription-queue',
    isActive: true,
  },
  {
    name: 'subscription-reminder',
    description: '3 gün kala hatırlatma mail',
    schedule: '0 9 * * *', // Her gün 09:00
    queueName: 'subscription-queue',
    isActive: true,
  },
  {
    name: 'order-auto-complete',
    description: '14 gün teslim edilmiş siparişleri tamamla',
    schedule: '0 2 * * *', // Her gün 02:00
    queueName: 'order-queue',
    isActive: true,
  },
  {
    name: 'loyalty-birthday',
    description: 'Doğum günü bonus puanı',
    schedule: '0 8 * * *', // Her gün 08:00
    queueName: 'loyalty-queue',
    isActive: true,
  },
  {
    name: 'loyalty-expiry',
    description: 'Süresi dolan puanları expire et',
    schedule: '0 1 * * *', // Her gün 01:00
    queueName: 'loyalty-queue',
    isActive: true,
  },
  {
    name: 'price-schedule',
    description: 'Zamanlı fiyat güncellemelerini uygula',
    schedule: '0 * * * *', // Her saat
    queueName: 'pricing-queue',
    isActive: true,
  },
  {
    name: 'stock-alert',
    description: 'Düşük stok bildirimi',
    schedule: '*/30 * * * *', // Her 30 dk
    queueName: 'stock-queue',
    isActive: true,
  },
  {
    name: 'dashboard-refresh',
    description: 'Admin dashboard KPI cache yenile',
    schedule: '*/15 * * * *', // Her 15 dk
    queueName: 'analytics-queue',
    isActive: true,
  },
  {
    name: 'shipment-tracking',
    description: 'Kargo durumu güncelle (API)',
    schedule: '0 */2 * * *', // Her 2 saat
    queueName: 'shipping-queue',
    isActive: true,
  },
  {
    name: 'email-queue',
    description: 'Bekleyen e-postaları gönder',
    schedule: '*/5 * * * *', // Her 5 dk
    queueName: 'email-queue',
    isActive: true,
  },
  {
    name: 'jwt-cleanup',
    description: 'Süresi dolmuş JWT blacklist temizle',
    schedule: '0 4 * * *', // Her gün 04:00
    queueName: 'cleanup-queue',
    isActive: true,
  },
  {
    name: 'session-cleanup',
    description: 'Eski oturumları temizle',
    schedule: '0 5 * * *', // Her gün 05:00
    queueName: 'cleanup-queue',
    isActive: true,
  },
  {
    name: 'analytics-daily',
    description: 'Günlük analiz hesapla',
    schedule: '30 0 * * *', // Her gün 00:30
    queueName: 'analytics-queue',
    isActive: true,
  },
  {
    name: 'b2b-lead-followup',
    description: 'B2B lead takip hatırlatması',
    schedule: '0 10 * * *', // Her gün 10:00
    queueName: 'b2b-queue',
    isActive: true,
  },
];

export interface JobInfo {
  name: string;
  description: string;
  schedule: string;
  isActive: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  lastStatus: CronJobStatus | null;
  lastDuration: number | null;
}

export interface JobLog {
  id: string;
  jobName: string;
  status: CronJobStatus;
  startedAt: Date;
  finishedAt: Date | null;
  duration: number | null;
  result: any;
  error: string | null;
}

@Injectable()
export class CronJobService implements OnModuleInit {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectQueue('ops-queue') private readonly opsQueue: Queue,
  ) {}

  async onModuleInit() {
    // Seed cron jobs to database if not exists
    await this.seedJobs();
    this.logger.log('Cron jobs initialized');
  }

  /**
   * Seed job definitions to database
   */
  private async seedJobs(): Promise<void> {
    for (const job of CRON_JOBS) {
      await this.prisma.cronJob.upsert({
        where: { name: job.name },
        update: {
          description: job.description,
          schedule: job.schedule,
        },
        create: {
          name: job.name,
          description: job.description,
          schedule: job.schedule,
          isActive: job.isActive,
        },
      });
    }
  }

  /**
   * Get all cron jobs with their status
   */
  async getAllJobs(): Promise<JobInfo[]> {
    const jobs = await this.prisma.cronJob.findMany({
      orderBy: { name: 'asc' },
      include: {
        logs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    return jobs.map((job) => {
      const lastLog = job.logs[0];
      let nextRunAt: Date | null = null;

      if (job.isActive) {
        try {
          const interval = CronExpressionParser.parse(job.schedule);
          nextRunAt = interval.next().toDate();
        } catch {
          // Invalid cron expression
        }
      }

      return {
        name: job.name,
        description: job.description || '',
        schedule: job.schedule,
        isActive: job.isActive,
        lastRunAt: job.lastRunAt,
        nextRunAt,
        lastStatus: lastLog?.status || null,
        lastDuration: lastLog?.duration || null,
      };
    });
  }

  /**
   * Get job by name
   */
  async getJob(name: string): Promise<JobInfo | null> {
    const job = await this.prisma.cronJob.findUnique({
      where: { name },
      include: {
        logs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!job) return null;

    const lastLog = job.logs[0];
    let nextRunAt: Date | null = null;

    if (job.isActive) {
      try {
        const interval = CronExpressionParser.parse(job.schedule);
        nextRunAt = interval.next().toDate();
      } catch {
        // Invalid cron expression
      }
    }

    return {
      name: job.name,
      description: job.description || '',
      schedule: job.schedule,
      isActive: job.isActive,
      lastRunAt: job.lastRunAt,
      nextRunAt,
      lastStatus: lastLog?.status || null,
      lastDuration: lastLog?.duration || null,
    };
  }

  /**
   * Toggle job active status
   */
  async toggleJob(name: string): Promise<{ isActive: boolean }> {
    const job = await this.prisma.cronJob.findUnique({ where: { name } });
    if (!job) {
      throw new Error(`Job not found: ${name}`);
    }

    const updated = await this.prisma.cronJob.update({
      where: { name },
      data: { isActive: !job.isActive },
    });

    this.logger.log(
      `Job ${name} toggled to ${updated.isActive ? 'active' : 'inactive'}`,
    );

    return { isActive: updated.isActive };
  }

  /**
   * Trigger a job manually
   */
  async triggerJob(
    name: string,
  ): Promise<{ triggered: boolean; jobId: string }> {
    const job = await this.prisma.cronJob.findUnique({ where: { name } });
    if (!job) {
      throw new Error(`Job not found: ${name}`);
    }

    // Add job to queue
    const queueJob = await this.opsQueue.add(name, {
      manual: true,
      triggeredAt: new Date(),
    });

    this.logger.log(`Job ${name} triggered manually, jobId: ${queueJob.id}`);

    return { triggered: true, jobId: queueJob.id as string };
  }

  /**
   * Get job logs
   */
  async getJobLogs(name: string, limit = 50): Promise<JobLog[]> {
    const logs = await this.prisma.cronJobLog.findMany({
      where: { jobName: name },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      jobName: log.jobName,
      status: log.status,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
      duration: log.duration,
      result: log.result,
      error: log.error,
    }));
  }

  /**
   * Get recent logs across all jobs
   */
  async getRecentLogs(limit = 100): Promise<JobLog[]> {
    const logs = await this.prisma.cronJobLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      jobName: log.jobName,
      status: log.status,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
      duration: log.duration,
      result: log.result,
      error: log.error,
    }));
  }

  /**
   * Log job start
   */
  async logJobStart(jobName: string): Promise<string> {
    const job = await this.prisma.cronJob.findUnique({
      where: { name: jobName },
    });
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    const log = await this.prisma.cronJobLog.create({
      data: {
        jobId: job.id,
        jobName,
        status: CronJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    await this.prisma.cronJob.update({
      where: { name: jobName },
      data: { lastRunAt: new Date() },
    });

    return log.id;
  }

  /**
   * Log job completion
   */
  async logJobComplete(
    logId: string,
    status: 'SUCCESS' | 'FAILED',
    result?: any,
    error?: string,
  ): Promise<void> {
    const startLog = await this.prisma.cronJobLog.findUnique({
      where: { id: logId },
    });
    if (!startLog) return;

    const finishedAt = new Date();
    const duration = finishedAt.getTime() - startLog.startedAt.getTime();

    await this.prisma.cronJobLog.update({
      where: { id: logId },
      data: {
        status:
          status === 'SUCCESS' ? CronJobStatus.SUCCESS : CronJobStatus.FAILED,
        finishedAt,
        duration,
        result: result ? JSON.parse(JSON.stringify(result)) : null,
        error,
      },
    });
  }

  /**
   * Check if a job is active
   */
  async isJobActive(name: string): Promise<boolean> {
    const job = await this.prisma.cronJob.findUnique({ where: { name } });
    return job?.isActive ?? false;
  }

  // ═══════════════════════════════════════════════════════════
  // SCHEDULED JOBS (using @Cron decorator)
  // These just trigger the queue jobs - actual logic is in processors
  // ═══════════════════════════════════════════════════════════

  @Cron('0 */6 * * *', { name: 'cart-cleanup' })
  async handleCartCleanup() {
    if (await this.isJobActive('cart-cleanup')) {
      await this.opsQueue.add('cart-cleanup', {});
    }
  }

  @Cron('0 3 * * *', { name: 'subscription-renewal' })
  async handleSubscriptionRenewal() {
    if (await this.isJobActive('subscription-renewal')) {
      await this.opsQueue.add('subscription-renewal', {});
    }
  }

  @Cron('0 9 * * *', { name: 'subscription-reminder' })
  async handleSubscriptionReminder() {
    if (await this.isJobActive('subscription-reminder')) {
      await this.opsQueue.add('subscription-reminder', {});
    }
  }

  @Cron('0 2 * * *', { name: 'order-auto-complete' })
  async handleOrderAutoComplete() {
    if (await this.isJobActive('order-auto-complete')) {
      await this.opsQueue.add('order-auto-complete', {});
    }
  }

  @Cron('0 8 * * *', { name: 'loyalty-birthday' })
  async handleLoyaltyBirthday() {
    if (await this.isJobActive('loyalty-birthday')) {
      await this.opsQueue.add('loyalty-birthday', {});
    }
  }

  @Cron('0 1 * * *', { name: 'loyalty-expiry' })
  async handleLoyaltyExpiry() {
    if (await this.isJobActive('loyalty-expiry')) {
      await this.opsQueue.add('loyalty-expiry', {});
    }
  }

  @Cron('0 * * * *', { name: 'price-schedule' })
  async handlePriceSchedule() {
    if (await this.isJobActive('price-schedule')) {
      await this.opsQueue.add('price-schedule', {});
    }
  }

  @Cron('*/30 * * * *', { name: 'stock-alert' })
  async handleStockAlert() {
    if (await this.isJobActive('stock-alert')) {
      await this.opsQueue.add('stock-alert', {});
    }
  }

  @Cron('*/15 * * * *', { name: 'dashboard-refresh' })
  async handleDashboardRefresh() {
    if (await this.isJobActive('dashboard-refresh')) {
      await this.opsQueue.add('dashboard-refresh', {});
    }
  }

  @Cron('0 */2 * * *', { name: 'shipment-tracking' })
  async handleShipmentTracking() {
    if (await this.isJobActive('shipment-tracking')) {
      await this.opsQueue.add('shipment-tracking', {});
    }
  }

  @Cron('*/5 * * * *', { name: 'email-queue' })
  async handleEmailQueue() {
    if (await this.isJobActive('email-queue')) {
      await this.opsQueue.add('email-queue', {});
    }
  }

  @Cron('0 4 * * *', { name: 'jwt-cleanup' })
  async handleJwtCleanup() {
    if (await this.isJobActive('jwt-cleanup')) {
      await this.opsQueue.add('jwt-cleanup', {});
    }
  }

  @Cron('0 5 * * *', { name: 'session-cleanup' })
  async handleSessionCleanup() {
    if (await this.isJobActive('session-cleanup')) {
      await this.opsQueue.add('session-cleanup', {});
    }
  }

  @Cron('30 0 * * *', { name: 'analytics-daily' })
  async handleAnalyticsDaily() {
    if (await this.isJobActive('analytics-daily')) {
      await this.opsQueue.add('analytics-daily', {});
    }
  }

  @Cron('0 10 * * *', { name: 'b2b-lead-followup' })
  async handleB2bLeadFollowup() {
    if (await this.isJobActive('b2b-lead-followup')) {
      await this.opsQueue.add('b2b-lead-followup', {});
    }
  }
}
