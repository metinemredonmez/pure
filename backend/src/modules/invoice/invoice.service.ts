import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateInvoiceDto, ListInvoicesQueryDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly refNo: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = 'https://api.birfatura.com';
    this.apiKey = this.configService.get<string>('BIRFATURA_API_KEY', '');
    this.refNo = this.configService.get<string>('BIRFATURA_REF_NO', '1251802');
  }

  // ══════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════

  /** Build standard headers for BirFatura API calls */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /** Execute a request against the BirFatura API and return parsed JSON */
  private async request<T = any>(
    method: string,
    path: string,
    options?: { body?: any; params?: Record<string, any> },
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
      headers: this.getHeaders(),
    };

    if (options?.body) {
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
            message: `BirFatura API: ${parsed.message || response.statusText}`,
            details: parsed,
          },
          response.status,
        );
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`BirFatura ${method} ${path} failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`BirFatura API: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════
  // INVOICE CRUD
  // ══════════════════════════════════════════════

  /**
   * Create a new e-invoice or e-arsiv invoice.
   * Builds the BirFatura-compatible payload from our DTO
   * and sends it to the API for creation.
   */
  async createInvoice(dto: CreateInvoiceDto) {
    // Map line items to BirFatura format
    const items = dto.items.map((item, index) => ({
      siraNo: index + 1,
      malHizmet: item.name,
      miktar: item.quantity,
      birim: item.unit,
      birimFiyat: item.unitPrice,
      kdvOrani: item.vatRate,
      iskontoOrani: item.discount || 0,
    }));

    // Calculate totals
    const totalBeforeVat = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - (item.discount || 0),
      0,
    );
    const totalVat = dto.items.reduce(
      (sum, item) =>
        sum +
        (item.quantity * item.unitPrice - (item.discount || 0)) *
          (item.vatRate / 100),
      0,
    );

    const payload: Record<string, any> = {
      refNo: this.refNo,
      faturaTipi: 'SATIS',
      belgeFormati: dto.type === 'E_FATURA' ? 'UBL' : 'EARSIV',
      aliciAdi: dto.buyerName,
      aliciAdresi: dto.buyerAddress || '',
      aliciEposta: dto.buyerEmail || '',
      kalemler: items,
      toplamTutar: totalBeforeVat + totalVat,
      not: dto.note || '',
    };

    // Add tax identifiers based on buyer type
    if (dto.buyerTaxNo) {
      payload.aliciVkn = dto.buyerTaxNo;
      payload.aliciVd = dto.buyerTaxOffice || '';
    } else if (dto.buyerTcNo) {
      payload.aliciTcNo = dto.buyerTcNo;
    }

    if (dto.orderRef) {
      payload.siparisNo = dto.orderRef;
    }

    this.logger.log(`Creating invoice for ${dto.buyerName}, total: ${payload.toplamTutar}`);

    return this.request('POST', '/invoices', { body: payload });
  }

  /**
   * Get a single invoice by its BirFatura ID.
   */
  async getInvoice(id: string) {
    return this.request('GET', `/invoices/${id}`);
  }

  /**
   * List invoices with optional filtering by date range and pagination.
   */
  async listInvoices(query?: ListInvoicesQueryDto) {
    const params: Record<string, any> = {};

    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.startDate) params.startDate = query.startDate;
    if (query?.endDate) params.endDate = query.endDate;

    return this.request('GET', '/invoices', { params });
  }

  /**
   * Cancel (iptal) an existing invoice by its BirFatura ID.
   */
  async cancelInvoice(id: string) {
    this.logger.log(`Cancelling invoice: ${id}`);
    return this.request('POST', `/invoices/${id}/cancel`);
  }
}
