import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Services
import { IntegrationSettingsService } from './integration-settings.service';
import { CacheManagementService } from './cache-management.service';
import { CronJobService } from './cron-job.service';

// Controllers
import { IntegrationSettingsController } from './integration-settings.controller';
import { AdminCacheController } from './cache-management.controller';
import { AdminCronController } from './cron-job.controller';

// Queue Processors
import { OpsQueueProcessor } from './queues/ops-queue.processor';

// Common Modules
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    IdentityModule,

    // Schedule Module (for @Cron decorators)
    ScheduleModule.forRoot(),

    // BullMQ Queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host') || 'localhost',
          port: config.get('redis.port') || 6380,
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 200, // Keep last 200 failed jobs
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    }),

    // Register Queue
    BullModule.registerQueue({
      name: 'ops-queue',
    }),
  ],
  controllers: [
    IntegrationSettingsController,
    AdminCacheController,
    AdminCronController,
  ],
  providers: [
    IntegrationSettingsService,
    CacheManagementService,
    CronJobService,
    OpsQueueProcessor,
  ],
  exports: [IntegrationSettingsService, CacheManagementService, CronJobService],
})
export class OpsModule {}
