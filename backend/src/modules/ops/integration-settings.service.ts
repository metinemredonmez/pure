import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { IntegrationGroup } from '@prisma/client';

@Injectable()
export class IntegrationSettingsService {
  private readonly logger = new Logger(IntegrationSettingsService.name);

  // Cache for frequently accessed settings
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  // ══════════════════════════════════════════════
  // PUBLIC GETTERS (for services)
  // ══════════════════════════════════════════════

  /**
   * Get a single setting value by key
   * Returns decrypted value if encrypted
   */
  async get(key: string): Promise<string | null> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const setting = await this.prisma.integrationSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    let value: string | null = null;

    if (setting.isEncrypted && setting.encryptedValue) {
      try {
        value = this.encryption.decrypt(setting.encryptedValue);
      } catch (error) {
        this.logger.error(`Failed to decrypt setting: ${key}`);
        return null;
      }
    } else {
      value = setting.plainValue;
    }

    // Cache the value
    if (value) {
      this.cache.set(key, { value, expiresAt: Date.now() + this.CACHE_TTL });
    }

    return value;
  }

  /**
   * Get multiple settings by keys
   */
  async getMany(keys: string[]): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  }

  /**
   * Get all settings for a group
   * Returns decrypted values
   */
  async getByGroup(group: IntegrationGroup): Promise<Record<string, string | null>> {
    const settings = await this.prisma.integrationSetting.findMany({
      where: { group },
      orderBy: { sortOrder: 'asc' },
    });

    const result: Record<string, string | null> = {};

    for (const setting of settings) {
      if (setting.isEncrypted && setting.encryptedValue) {
        try {
          result[setting.key] = this.encryption.decrypt(setting.encryptedValue);
        } catch {
          result[setting.key] = null;
        }
      } else {
        result[setting.key] = setting.plainValue;
      }
    }

    return result;
  }

  /**
   * Get boolean setting
   */
  async getBoolean(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value === 'true' || value === '1';
  }

  /**
   * Get number setting
   */
  async getNumber(key: string): Promise<number | null> {
    const value = await this.get(key);
    if (!value) return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }

  // ══════════════════════════════════════════════
  // ADMIN CRUD OPERATIONS
  // ══════════════════════════════════════════════

  /**
   * List all settings (for admin panel)
   * Returns masked values for encrypted settings
   */
  async listAll(group?: IntegrationGroup) {
    const where = group ? { group } : {};

    const settings = await this.prisma.integrationSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });

    return settings.map((setting) => ({
      id: setting.id,
      key: setting.key,
      group: setting.group,
      label: setting.label,
      description: setting.description,
      valueType: setting.valueType,
      enumOptions: setting.enumOptions,
      isEncrypted: setting.isEncrypted,
      isRequired: setting.isRequired,
      sortOrder: setting.sortOrder,
      hasValue: setting.isEncrypted
        ? !!setting.encryptedValue
        : !!setting.plainValue,
      value: setting.isEncrypted
        ? setting.encryptedValue
          ? '********'
          : null
        : setting.plainValue,
      updatedAt: setting.updatedAt,
    }));
  }

  /**
   * Get a single setting detail (for admin edit form)
   */
  async getDetail(key: string) {
    const setting = await this.prisma.integrationSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new BadRequestException(`Setting not found: ${key}`);
    }

    return {
      ...setting,
      value: setting.isEncrypted
        ? setting.encryptedValue
          ? '********'
          : null
        : setting.plainValue,
    };
  }

  /**
   * Update a setting value
   */
  async update(key: string, value: string | null) {
    const setting = await this.prisma.integrationSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new BadRequestException(`Setting not found: ${key}`);
    }

    // Validate required
    if (setting.isRequired && !value) {
      throw new BadRequestException(`${setting.label} is required`);
    }

    // Validate enum
    if (setting.valueType === 'enum' && value && setting.enumOptions.length > 0) {
      if (!setting.enumOptions.includes(value)) {
        throw new BadRequestException(
          `Invalid value. Must be one of: ${setting.enumOptions.join(', ')}`,
        );
      }
    }

    // Validate boolean
    if (setting.valueType === 'boolean' && value) {
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        throw new BadRequestException('Boolean must be true or false');
      }
    }

    // Validate number
    if (setting.valueType === 'number' && value) {
      if (isNaN(Number(value))) {
        throw new BadRequestException('Invalid number value');
      }
    }

    // Update value
    const updateData: any = {};

    if (setting.isEncrypted) {
      updateData.encryptedValue = value ? this.encryption.encrypt(value) : null;
      updateData.plainValue = null;
    } else {
      updateData.plainValue = value;
      updateData.encryptedValue = null;
    }

    await this.prisma.integrationSetting.update({
      where: { key },
      data: updateData,
    });

    // Clear cache
    this.cache.delete(key);

    this.logger.log(`Setting updated: ${key}`);

    return { success: true, key };
  }

  /**
   * Bulk update multiple settings
   */
  async bulkUpdate(updates: Array<{ key: string; value: string | null }>) {
    const results: Array<{ key: string; success: boolean; error?: string }> = [];

    for (const { key, value } of updates) {
      try {
        await this.update(key, value);
        results.push({ key, success: true });
      } catch (error: any) {
        results.push({ key, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Test a connection (for payment, email, etc.)
   */
  async testConnection(group: IntegrationGroup): Promise<{ success: boolean; message: string }> {
    const settings = await this.getByGroup(group);

    switch (group) {
      case IntegrationGroup.EMAIL:
        return this.testEmailConnection(settings);
      case IntegrationGroup.PAYMENT:
        return this.testPaymentConnection(settings);
      default:
        return { success: true, message: 'Test not available for this group' };
    }
  }

  private async testEmailConnection(
    settings: Record<string, string | null>,
  ): Promise<{ success: boolean; message: string }> {
    const { smtp_host, smtp_port, smtp_user, smtp_password } = settings;

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      return { success: false, message: 'SMTP settings incomplete' };
    }

    // Note: Actual connection test would require nodemailer
    return {
      success: true,
      message: `SMTP configured: ${smtp_host}:${smtp_port}`,
    };
  }

  private async testPaymentConnection(
    settings: Record<string, string | null>,
  ): Promise<{ success: boolean; message: string }> {
    const paytrConfigured = !!settings.paytr_merchant_id && !!settings.paytr_merchant_key;
    const iyzicoConfigured = !!settings.iyzico_api_key && !!settings.iyzico_secret_key;

    const providers: string[] = [];
    if (paytrConfigured) providers.push('PayTR');
    if (iyzicoConfigured) providers.push('iyzico');

    if (providers.length === 0) {
      return { success: false, message: 'No payment provider configured' };
    }

    return {
      success: true,
      message: `Configured providers: ${providers.join(', ')}`,
    };
  }

  // ══════════════════════════════════════════════
  // SEED DEFAULT SETTINGS
  // ══════════════════════════════════════════════

  /**
   * Seed all 39 integration settings
   * Call this in prisma/seed.ts or on app startup
   */
  async seedDefaults() {
    const settings = this.getDefaultSettings();

    for (const setting of settings) {
      await this.prisma.integrationSetting.upsert({
        where: { key: setting.key },
        create: setting,
        update: {
          label: setting.label,
          description: setting.description,
          valueType: setting.valueType,
          enumOptions: setting.enumOptions,
          isEncrypted: setting.isEncrypted,
          isRequired: setting.isRequired,
          sortOrder: setting.sortOrder,
        },
      });
    }

    this.logger.log(`Seeded ${settings.length} integration settings`);
  }

  private getDefaultSettings(): Array<{
    key: string;
    group: IntegrationGroup;
    label: string;
    description?: string;
    valueType: string;
    enumOptions?: string[];
    isEncrypted: boolean;
    isRequired: boolean;
    sortOrder: number;
  }> {
    return [
      // ══════════════════════════════════════════════
      // PAYMENT (12 settings, 5 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'paytr_merchant_id',
        group: IntegrationGroup.PAYMENT,
        label: 'PayTR Merchant ID',
        description: 'PayTR mağaza ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'paytr_merchant_key',
        group: IntegrationGroup.PAYMENT,
        label: 'PayTR Merchant Key',
        description: 'PayTR API key',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'paytr_merchant_salt',
        group: IntegrationGroup.PAYMENT,
        label: 'PayTR Merchant Salt',
        description: 'PayTR HMAC salt (webhook imza)',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 3,
      },
      {
        key: 'paytr_sandbox_mode',
        group: IntegrationGroup.PAYMENT,
        label: 'PayTR Sandbox Mode',
        description: 'true = test, false = canlı',
        valueType: 'boolean',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 4,
      },
      {
        key: 'iyzico_api_key',
        group: IntegrationGroup.PAYMENT,
        label: 'iyzico API Key',
        description: 'iyzico API key',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 5,
      },
      {
        key: 'iyzico_secret_key',
        group: IntegrationGroup.PAYMENT,
        label: 'iyzico Secret Key',
        description: 'iyzico secret',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 6,
      },
      {
        key: 'iyzico_base_url',
        group: IntegrationGroup.PAYMENT,
        label: 'iyzico Base URL',
        description: 'sandbox: sandbox-api.iyzipay.com / canlı: api.iyzipay.com',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 7,
      },
      {
        key: 'iyzico_sandbox_mode',
        group: IntegrationGroup.PAYMENT,
        label: 'iyzico Sandbox Mode',
        description: 'true = test, false = canlı',
        valueType: 'boolean',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 8,
      },
      {
        key: 'google_pay_merchant_id',
        group: IntegrationGroup.PAYMENT,
        label: 'Google Pay Merchant ID',
        description: 'Google Pay merchant tanımlayıcı',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 9,
      },
      {
        key: 'google_pay_environment',
        group: IntegrationGroup.PAYMENT,
        label: 'Google Pay Environment',
        description: 'TEST / PRODUCTION',
        valueType: 'enum',
        enumOptions: ['TEST', 'PRODUCTION'],
        isEncrypted: false,
        isRequired: false,
        sortOrder: 10,
      },
      {
        key: 'apple_pay_merchant_id',
        group: IntegrationGroup.PAYMENT,
        label: 'Apple Pay Merchant ID',
        description: 'Apple Pay merchant ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 11,
      },
      {
        key: 'apple_pay_certificate',
        group: IntegrationGroup.PAYMENT,
        label: 'Apple Pay Certificate',
        description: 'Apple Pay .pem sertifika içeriği',
        valueType: 'text',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 12,
      },

      // ══════════════════════════════════════════════
      // MAP (1 setting, 1 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'google_maps_api_key',
        group: IntegrationGroup.MAP,
        label: 'Google Maps API Key',
        description: 'Maps JavaScript API + Geocoding + Places',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 1,
      },

      // ══════════════════════════════════════════════
      // EMAIL (5 settings, 1 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'smtp_host',
        group: IntegrationGroup.EMAIL,
        label: 'SMTP Host',
        description: 'mail.olentia.com veya smtp.gmail.com',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'smtp_port',
        group: IntegrationGroup.EMAIL,
        label: 'SMTP Port',
        description: '587 (TLS) veya 465 (SSL)',
        valueType: 'number',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'smtp_user',
        group: IntegrationGroup.EMAIL,
        label: 'SMTP User',
        description: 'SMTP kullanıcı adı',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 3,
      },
      {
        key: 'smtp_password',
        group: IntegrationGroup.EMAIL,
        label: 'SMTP Password',
        description: 'SMTP şifre',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 4,
      },
      {
        key: 'smtp_from',
        group: IntegrationGroup.EMAIL,
        label: 'SMTP From',
        description: '"Olentia Pure <info@olentia.com>"',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 5,
      },

      // ══════════════════════════════════════════════
      // NOTIFICATION (4 settings, 2 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'firebase_server_key',
        group: IntegrationGroup.NOTIFICATION,
        label: 'Firebase Server Key',
        description: 'FCM server key (mobil push)',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'firebase_project_id',
        group: IntegrationGroup.NOTIFICATION,
        label: 'Firebase Project ID',
        description: 'Firebase proje ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'onesignal_app_id',
        group: IntegrationGroup.NOTIFICATION,
        label: 'OneSignal App ID',
        description: 'OneSignal uygulama ID (web push)',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 3,
      },
      {
        key: 'onesignal_api_key',
        group: IntegrationGroup.NOTIFICATION,
        label: 'OneSignal API Key',
        description: 'OneSignal REST API key',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 4,
      },

      // ══════════════════════════════════════════════
      // AI (2 settings, 1 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'openai_api_key',
        group: IntegrationGroup.AI,
        label: 'OpenAI API Key',
        description: 'OpenAI API key (sk-...)',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'openai_model',
        group: IntegrationGroup.AI,
        label: 'OpenAI Model',
        description: 'gpt-4 / gpt-4o / gpt-3.5-turbo',
        valueType: 'enum',
        enumOptions: ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        isEncrypted: false,
        isRequired: false,
        sortOrder: 2,
      },

      // ══════════════════════════════════════════════
      // AUTH (7 settings, 3 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'google_oauth_client_id',
        group: IntegrationGroup.AUTH,
        label: 'Google OAuth Client ID',
        description: "Google Cloud Console'dan",
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'google_oauth_client_secret',
        group: IntegrationGroup.AUTH,
        label: 'Google OAuth Client Secret',
        description: 'Google OAuth secret',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'google_oauth_callback_url',
        group: IntegrationGroup.AUTH,
        label: 'Google OAuth Callback URL',
        description: 'https://api.olentia.com/api/auth/google/callback',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 3,
      },
      {
        key: 'apple_oauth_service_id',
        group: IntegrationGroup.AUTH,
        label: 'Apple OAuth Service ID',
        description: 'Apple Developer — Services ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 4,
      },
      {
        key: 'apple_oauth_team_id',
        group: IntegrationGroup.AUTH,
        label: 'Apple OAuth Team ID',
        description: 'Apple Developer — Team ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 5,
      },
      {
        key: 'apple_oauth_key_id',
        group: IntegrationGroup.AUTH,
        label: 'Apple OAuth Key ID',
        description: 'Apple Developer — Key ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 6,
      },
      {
        key: 'apple_oauth_private_key',
        group: IntegrationGroup.AUTH,
        label: 'Apple OAuth Private Key',
        description: 'Apple .p8 private key içeriği',
        valueType: 'text',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 7,
      },

      // ══════════════════════════════════════════════
      // SHIPPING (4 settings, 4 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'yurtici_api_key',
        group: IntegrationGroup.SHIPPING,
        label: 'Yurtiçi API Key',
        description: 'Yurtiçi Kargo API kullanıcı',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'yurtici_api_password',
        group: IntegrationGroup.SHIPPING,
        label: 'Yurtiçi API Password',
        description: 'Yurtiçi Kargo API şifre',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'aras_api_key',
        group: IntegrationGroup.SHIPPING,
        label: 'Aras API Key',
        description: 'Aras Kargo API key',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 3,
      },
      {
        key: 'mng_api_key',
        group: IntegrationGroup.SHIPPING,
        label: 'MNG API Key',
        description: 'MNG Kargo API key',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 4,
      },

      // ══════════════════════════════════════════════
      // ANALYTICS (3 settings, 0 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'google_analytics_id',
        group: IntegrationGroup.ANALYTICS,
        label: 'Google Analytics ID',
        description: 'G-XXXXXXXXXX veya UA-XXXXXXX',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 1,
      },
      {
        key: 'facebook_pixel_id',
        group: IntegrationGroup.ANALYTICS,
        label: 'Facebook Pixel ID',
        description: 'Meta Pixel ID',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 2,
      },
      {
        key: 'hotjar_site_id',
        group: IntegrationGroup.ANALYTICS,
        label: 'Hotjar Site ID',
        description: 'Hotjar site numarası',
        valueType: 'string',
        isEncrypted: false,
        isRequired: false,
        sortOrder: 3,
      },

      // ══════════════════════════════════════════════
      // WEBHOOK (1 setting, 1 encrypted)
      // ══════════════════════════════════════════════
      {
        key: 'webhook_signing_secret',
        group: IntegrationGroup.WEBHOOK,
        label: 'Webhook Signing Secret',
        description: 'HMAC-SHA256 imza anahtarı',
        valueType: 'string',
        isEncrypted: true,
        isRequired: false,
        sortOrder: 1,
      },
    ];
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    this.logger.log('Integration settings cache cleared');
  }
}
