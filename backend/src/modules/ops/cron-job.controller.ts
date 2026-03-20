import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CronJobService, CRON_JOBS } from './cron-job.service';

@ApiTags('Admin - Cron Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/cron')
export class AdminCronController {
  constructor(private readonly cronJobService: CronJobService) {}

  /**
   * GET /admin/cron/jobs — Tüm jobları listele
   */
  @Get('jobs')
  @ApiOperation({ summary: 'List all cron jobs with status' })
  @ApiResponse({
    status: 200,
    description: 'Cron jobs list',
    schema: {
      example: [
        {
          name: 'cart-cleanup',
          description: '7 gün eski terk edilmiş sepetleri sil',
          schedule: '0 */6 * * *',
          isActive: true,
          lastRunAt: '2024-01-15T06:00:00Z',
          nextRunAt: '2024-01-15T12:00:00Z',
          lastStatus: 'SUCCESS',
          lastDuration: 1250,
        },
      ],
    },
  })
  async getJobs() {
    return this.cronJobService.getAllJobs();
  }

  /**
   * GET /admin/cron/jobs/:name — Tek job detayı
   */
  @Get('jobs/:name')
  @ApiOperation({ summary: 'Get single job details' })
  @ApiParam({
    name: 'name',
    description: 'Job name',
    enum: CRON_JOBS.map((j) => j.name),
  })
  async getJob(@Param('name') name: string) {
    const job = await this.cronJobService.getJob(name);
    if (!job) {
      throw new NotFoundException(`Job not found: ${name}`);
    }
    return job;
  }

  /**
   * POST /admin/cron/jobs/:name/trigger — Manuel tetikle
   */
  @Post('jobs/:name/trigger')
  @ApiOperation({ summary: 'Manually trigger a job' })
  @ApiParam({
    name: 'name',
    description: 'Job name',
    enum: CRON_JOBS.map((j) => j.name),
  })
  @ApiResponse({
    status: 200,
    description: 'Job triggered',
    schema: {
      example: {
        triggered: true,
        jobId: 'job-123456',
      },
    },
  })
  async triggerJob(@Param('name') name: string) {
    try {
      return await this.cronJobService.triggerJob(name);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  /**
   * PATCH /admin/cron/jobs/:name/toggle — Aktif/Pasif yap
   */
  @Patch('jobs/:name/toggle')
  @ApiOperation({ summary: 'Toggle job active status' })
  @ApiParam({
    name: 'name',
    description: 'Job name',
    enum: CRON_JOBS.map((j) => j.name),
  })
  @ApiResponse({
    status: 200,
    description: 'Job toggled',
    schema: {
      example: { isActive: false },
    },
  })
  async toggleJob(@Param('name') name: string) {
    try {
      return await this.cronJobService.toggleJob(name);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  /**
   * GET /admin/cron/jobs/:name/logs — Job çalışma logları
   */
  @Get('jobs/:name/logs')
  @ApiOperation({ summary: 'Get job execution logs' })
  @ApiParam({
    name: 'name',
    description: 'Job name',
    enum: CRON_JOBS.map((j) => j.name),
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of logs to return (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Job logs',
    schema: {
      example: [
        {
          id: 'log-123',
          jobName: 'cart-cleanup',
          status: 'SUCCESS',
          startedAt: '2024-01-15T06:00:00Z',
          finishedAt: '2024-01-15T06:00:01Z',
          duration: 1250,
          result: { deleted: 15 },
          error: null,
        },
      ],
    },
  })
  async getJobLogs(
    @Param('name') name: string,
    @Query('limit') limit?: number,
  ) {
    return this.cronJobService.getJobLogs(name, limit || 50);
  }

  /**
   * GET /admin/cron/logs — Tüm jobların son logları
   */
  @Get('logs')
  @ApiOperation({ summary: 'Get recent logs across all jobs' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of logs to return (default: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent logs',
  })
  async getRecentLogs(@Query('limit') limit?: number) {
    return this.cronJobService.getRecentLogs(limit || 100);
  }

  /**
   * GET /admin/cron/definitions — Job tanımları (schedule açıklamaları)
   */
  @Get('definitions')
  @ApiOperation({ summary: 'Get job definitions' })
  @ApiResponse({
    status: 200,
    description: 'Job definitions with schedule explanations',
    schema: {
      example: CRON_JOBS.map((j) => ({
        name: j.name,
        description: j.description,
        schedule: j.schedule,
        scheduleHuman: 'Every 6 hours',
      })),
    },
  })
  getDefinitions() {
    return CRON_JOBS.map((job) => ({
      name: job.name,
      description: job.description,
      schedule: job.schedule,
      scheduleHuman: this.parseCronHuman(job.schedule),
    }));
  }

  /**
   * Convert cron expression to human readable format
   */
  private parseCronHuman(schedule: string): string {
    const cronMap: Record<string, string> = {
      '0 */6 * * *': 'Her 6 saatte bir',
      '0 3 * * *': 'Her gün saat 03:00',
      '0 9 * * *': 'Her gün saat 09:00',
      '0 2 * * *': 'Her gün saat 02:00',
      '0 8 * * *': 'Her gün saat 08:00',
      '0 1 * * *': 'Her gün saat 01:00',
      '0 * * * *': 'Her saat başı',
      '*/30 * * * *': 'Her 30 dakikada bir',
      '*/15 * * * *': 'Her 15 dakikada bir',
      '0 */2 * * *': 'Her 2 saatte bir',
      '*/5 * * * *': 'Her 5 dakikada bir',
      '0 4 * * *': 'Her gün saat 04:00',
      '0 5 * * *': 'Her gün saat 05:00',
      '30 0 * * *': 'Her gün saat 00:30',
      '0 10 * * *': 'Her gün saat 10:00',
    };

    return cronMap[schedule] || schedule;
  }
}
