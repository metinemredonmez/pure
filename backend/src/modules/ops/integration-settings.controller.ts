import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { IntegrationSettingsService } from './integration-settings.service';
import {
  UpdateSettingDto,
  UpdateSettingValueDto,
  BulkUpdateSettingsDto,
  TestConnectionDto,
  SettingsListResponseDto,
} from './dto/integration-settings.dto';
import { IntegrationGroup } from '@prisma/client';

@ApiTags('Admin - Integration Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/settings/integrations')
export class IntegrationSettingsController {
  constructor(private readonly settingsService: IntegrationSettingsService) {}

  // ══════════════════════════════════════════════
  // LIST & READ
  // ══════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'List all integration settings' })
  @ApiQuery({ name: 'group', enum: IntegrationGroup, required: false })
  @ApiResponse({ status: 200, type: SettingsListResponseDto })
  async listAll(@Query('group') group?: IntegrationGroup) {
    const settings = await this.settingsService.listAll(group);
    return {
      settings,
      total: settings.length,
    };
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all groups with summary' })
  async getGroups() {
    const groups = Object.values(IntegrationGroup);
    const summaries: Array<{
      group: IntegrationGroup;
      label: string;
      totalSettings: number;
      configuredSettings: number;
      encryptedSettings: number;
    }> = [];

    const groupLabels: Record<IntegrationGroup, string> = {
      [IntegrationGroup.PAYMENT]: 'Ödeme Entegrasyonları',
      [IntegrationGroup.MAP]: 'Harita & Konum',
      [IntegrationGroup.EMAIL]: 'SMTP Sunucu',
      [IntegrationGroup.NOTIFICATION]: 'Push Bildirim',
      [IntegrationGroup.AI]: 'Yapay Zeka',
      [IntegrationGroup.AUTH]: 'OAuth Sağlayıcılar',
      [IntegrationGroup.SHIPPING]: 'Kargo API',
      [IntegrationGroup.ANALYTICS]: 'Analitik & Tracking',
      [IntegrationGroup.WEBHOOK]: 'Webhook',
    };

    for (const group of groups) {
      const settings = await this.settingsService.listAll(group);
      summaries.push({
        group,
        label: groupLabels[group],
        totalSettings: settings.length,
        configuredSettings: settings.filter((s) => s.hasValue).length,
        encryptedSettings: settings.filter((s) => s.isEncrypted).length,
      });
    }

    return summaries;
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single setting detail' })
  async getDetail(@Param('key') key: string) {
    return this.settingsService.getDetail(key);
  }

  // ══════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════

  @Put(':key')
  @ApiOperation({ summary: 'Update a single setting' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingValueDto,
  ) {
    return this.settingsService.update(key, dto.value ?? null);
  }

  @Put()
  @ApiOperation({ summary: 'Bulk update multiple settings' })
  async bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    return this.settingsService.bulkUpdate(
      dto.settings.map((s) => ({
        key: s.key,
        value: s.value ?? null,
      })),
    );
  }

  // ══════════════════════════════════════════════
  // TEST CONNECTION
  // ══════════════════════════════════════════════

  @Post('test')
  @ApiOperation({ summary: 'Test connection for a group' })
  async testConnection(@Body() dto: TestConnectionDto) {
    return this.settingsService.testConnection(dto.group);
  }

  // ══════════════════════════════════════════════
  // SEED
  // ══════════════════════════════════════════════

  @Post('seed')
  @ApiOperation({ summary: 'Seed default settings (creates missing keys)' })
  async seedDefaults() {
    await this.settingsService.seedDefaults();
    return { success: true, message: 'Settings seeded successfully' };
  }

  // ══════════════════════════════════════════════
  // CACHE
  // ══════════════════════════════════════════════

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear settings cache' })
  async clearCache() {
    this.settingsService.clearCache();
    return { success: true, message: 'Cache cleared' };
  }
}
