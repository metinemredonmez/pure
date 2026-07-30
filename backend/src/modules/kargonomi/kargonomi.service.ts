import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationSettingsService } from '../ops/integration-settings.service';
import {
  CreateKargonomiShipmentDto,
  UpdateKargonomiShipmentDto,
  ConfirmShippingDto,
  CancelKargonomiShipmentDto,
} from './dto/kargonomi.dto';

@Injectable()
export class KargonomiService {
  private readonly logger = new Logger(KargonomiService.name);
  private readonly baseUrl = 'https://app.kargonomi.com.tr/api/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly settings: IntegrationSettingsService,
  ) {}

  // ══════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════

  /** Admin (Entegrasyonlar) ayarından token; yoksa env'e düşer */
  private async getToken(): Promise<string> {
    const fromDb = await this.settings.get('kargonomi_api_token');
    return fromDb || this.configService.get<string>('KARGONOMI_API_TOKEN', '');
  }

  /** Webhook imza doğrulama anahtarı — admin ayarı; yoksa env */
  async getWebhookSecret(): Promise<string> {
    const fromDb = await this.settings.get('kargonomi_webhook_secret');
    return fromDb || this.configService.get<string>('KARGONOMI_WEBHOOK_SECRET', '');
  }

  /** Build standard Authorization headers for Kargonomi API calls */
  private async getHeaders(): Promise<Record<string, string>> {
    return {
      Authorization: `Bearer ${await this.getToken()}`,
      Accept: 'application/json',
    };
  }

  /** Execute a request against the Kargonomi API and return parsed JSON */
  private async request<T = any>(
    method: string,
    path: string,
    options?: {
      body?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      rawResponse?: boolean;
    },
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    // Append query params
    if (options?.params) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          qs.append(key, String(value));
        }
      }
      const qsStr = qs.toString();
      if (qsStr) url += `?${qsStr}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...(await this.getHeaders()),
        ...(options?.headers || {}),
      },
    };

    if (options?.body) {
      fetchOptions.headers = {
        ...(fetchOptions.headers as Record<string, string>),
        'Content-Type': 'application/json',
      };
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorBody = await response.text();
        let parsed: any;
        try {
          parsed = JSON.parse(errorBody);
        } catch {
          parsed = { message: errorBody };
        }
        throw new HttpException(
          {
            message: `Kargonomi API: ${parsed.message || response.statusText}`,
            details: parsed,
          },
          response.status,
        );
      }

      if (options?.rawResponse) {
        return response as any;
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Kargonomi ${method} ${path} failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Kargonomi API: ${error.message}`);
    }
  }

  /** Execute a POST with form-data body */
  private async postFormData<T = any>(path: string, formFields: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const form = new FormData();
    for (const [key, value] of Object.entries(formFields)) {
      form.append(key, String(value));
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: 'application/json',
        },
        body: form,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let parsed: any;
        try {
          parsed = JSON.parse(errorBody);
        } catch {
          parsed = { message: errorBody };
        }
        throw new HttpException(
          {
            message: `Kargonomi API: ${parsed.message || response.statusText}`,
            details: parsed,
          },
          response.status,
        );
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Kargonomi POST form-data ${path} failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Kargonomi API: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════
  // SHIPMENT CRUD
  // ══════════════════════════════════════════════

  /**
   * List all shipments with optional pagination.
   * GET /shipments
   */
  async listShipments(page?: number) {
    return this.request('GET', '/shipments', {
      params: page ? { page } : undefined,
    });
  }

  /**
   * Get a single shipment by its Kargonomi ID.
   * GET /shipments/{id}
   */
  async getShipment(id: number) {
    return this.request('GET', `/shipments/${id}`);
  }

  /**
   * Create a new draft shipment in Kargonomi.
   * POST /shipments
   */
  async createShipment(dto: CreateKargonomiShipmentDto) {
    return this.request('POST', '/shipments', { body: dto });
  }

  /**
   * Update an existing shipment (draft only).
   * PATCH /shipments/{id}
   */
  async updateShipment(id: number, dto: UpdateKargonomiShipmentDto) {
    return this.request('PATCH', `/shipments/${id}`, { body: dto });
  }

  /**
   * Delete a draft shipment.
   * DELETE /shipments/{id}
   */
  async deleteShipment(id: number) {
    return this.request('DELETE', `/shipments/${id}`);
  }

  // ══════════════════════════════════════════════
  // PRICE COMPARISON & CONFIRMATION
  // ══════════════════════════════════════════════

  /**
   * Get shipping price comparison for a shipment.
   * Returns quotes from multiple cargo providers.
   * GET /shipment-price-comparison/{id}
   */
  async getPriceComparison(id: number) {
    return this.request('GET', `/shipment-price-comparison/${id}`);
  }

  /**
   * Confirm shipping with a selected provider/price.
   * Sends form-data with shipment_id and provider_id.
   * POST /confirm-shipping-price
   */
  async confirmShipping(dto: ConfirmShippingDto) {
    // Doküman: alan adı shipping_provider_id. Uyumluluk için ikisini de gönderiyoruz.
    return this.postFormData('/confirm-shipping-price', {
      shipment_id: dto.shipment_id,
      shipping_provider_id: dto.provider_id,
      provider_id: dto.provider_id,
    });
  }

  // ══════════════════════════════════════════════
  // CANCEL & BARCODE
  // ══════════════════════════════════════════════

  /**
   * Cancel an existing shipment.
   * POST /shipments/cancel
   */
  async cancelShipment(dto: CancelKargonomiShipmentDto) {
    return this.request('POST', '/shipments/cancel', { body: dto });
  }

  /**
   * Get the barcode/label PDF for a shipment.
   * Returns a PDF buffer from the Kargonomi API.
   * GET /shipments/{id}/barcode?format=pdf
   */
  async getBarcode(id: number): Promise<Buffer> {
    const url = `${this.baseUrl}/shipments/${id}/barcode?format=pdf`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new HttpException(
          { message: `Kargonomi API: Failed to get barcode` },
          response.status,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Kargonomi barcode fetch failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Kargonomi API: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════
  // ACCOUNT & LOCATION
  // ══════════════════════════════════════════════

  /**
   * Get the current account credit/balance.
   * GET /user/credit
   */
  async getCredit() {
    return this.request('GET', '/user/credit');
  }

  /**
   * Get all states (iller).
   * GET /states
   */
  async getStates() {
    return this.request('GET', '/states');
  }

  /**
   * Get cities (ilceler) for a given state.
   * GET /cities/{stateId}
   */
  async getCities(stateId: number) {
    return this.request('GET', `/cities/${stateId}`);
  }

  /**
   * İl (state) ve ilçe (city) adından Kargonomi state_id/city_id çözer.
   * Yanıt yapısı dokümanda örneklenmediği için alan adları savunmacı okunur
   * (id + name/text/title/il/ilce). Bulunamazsa null döner.
   */
  async resolveLocationIds(
    stateName: string,
    cityName?: string,
  ): Promise<{ stateId: number | null; cityId: number | null; raw?: any }> {
    const norm = (s: any) =>
      String(s || '')
        .toLocaleLowerCase('tr-TR')
        .trim();
    const pickList = (res: any): any[] =>
      Array.isArray(res) ? res : res?.data || res?.states || res?.cities || [];
    const nameOf = (o: any) => o?.name ?? o?.text ?? o?.title ?? o?.il ?? o?.ilce ?? o?.city ?? o?.sehir;
    const idOf = (o: any) => o?.id ?? o?.value ?? o?.state_id ?? o?.city_id;

    const statesRes = await this.getStates();
    const states = pickList(statesRes);
    const state = states.find((s) => norm(nameOf(s)) === norm(stateName));
    const stateId = state ? Number(idOf(state)) : null;
    if (!stateId) return { stateId: null, cityId: null, raw: statesRes };

    let cityId: number | null = null;
    if (cityName) {
      const citiesRes = await this.getCities(stateId);
      const cities = pickList(citiesRes);
      const city = cities.find((c) => norm(nameOf(c)) === norm(cityName));
      cityId = city ? Number(idOf(city)) : null;
    }
    return { stateId, cityId };
  }

  // ══════════════════════════════════════════════
  // WEBHOOK VERIFICATION
  // ══════════════════════════════════════════════

  /**
   * Verify the HMAC-SHA256 signature from a Kargonomi webhook request.
   * Compares the X-Webhook-Signature header against a computed HMAC of the raw body.
   */
  async verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
  ): Promise<boolean> {
    const crypto = require('crypto');
    const secret = await this.getWebhookSecret();
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(computed, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      // timingSafeEqual throws if buffer lengths differ
      return false;
    }
  }
}
