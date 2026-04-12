import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateKargonomiShipmentDto,
  UpdateKargonomiShipmentDto,
  ConfirmShippingDto,
  CancelKargonomiShipmentDto,
} from './dto/kargonomi.dto';

@Injectable()
export class KargonomiService {
  private readonly logger = new Logger(KargonomiService.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = 'https://app.kargonomi.com.tr/api/v1';
    this.apiToken = this.configService.get<string>('KARGONOMI_API_TOKEN', '');
    this.webhookSecret = this.configService.get<string>('KARGONOMI_WEBHOOK_SECRET', '');
  }

  // ══════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════

  /** Build standard Authorization headers for Kargonomi API calls */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
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
        ...this.getHeaders(),
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
          Authorization: `Bearer ${this.apiToken}`,
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
    return this.postFormData('/confirm-shipping-price', {
      shipment_id: dto.shipment_id,
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
        headers: this.getHeaders(),
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

  // ══════════════════════════════════════════════
  // WEBHOOK VERIFICATION
  // ══════════════════════════════════════════════

  /**
   * Verify the HMAC-SHA256 signature from a Kargonomi webhook request.
   * Compares the X-Webhook-Signature header against a computed HMAC of the raw body.
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const crypto = require('crypto');
    const computed = crypto
      .createHmac('sha256', this.webhookSecret)
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
