import { Injectable, Logger } from '@nestjs/common';
import {
  CarrierInterface,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
  LabelResponse,
} from './carrier.interface';
import { IntegrationSettingsService } from '../../ops/integration-settings.service';

@Injectable()
export class MngCarrier implements CarrierInterface {
  private readonly logger = new Logger(MngCarrier.name);
  private readonly baseUrl = 'https://service.mngkargo.com.tr';

  constructor(private settings: IntegrationSettingsService) {}

  private async getCredentials() {
    const apiKey = await this.settings.get('mng_api_key');
    return { apiKey };
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      this.logger.warn('MNG credentials not configured');
      return {
        success: false,
        error: 'MNG Kargo API credentials not configured',
      };
    }

    try {
      // MNG REST API çağrısı
      const requestBody = {
        token: apiKey,
        siparisNo: request.orderNumber,
        alici: {
          ad: request.recipientName,
          tel: request.recipientPhone,
          adres: request.recipientAddress,
          il: request.recipientCity,
          ilce: request.recipientDistrict,
          postaKodu: request.recipientPostalCode,
        },
        kargo: {
          adet: request.itemCount,
          agirlik: request.weight,
          desi: request.desi || Math.ceil(request.weight * 1.5),
          deger: request.totalValue,
          aciklama: request.itemDescription || 'Kahve ürünleri',
        },
        odemeTipi: 'GONDEREN',
        hizmetTipi: request.isExpress ? 'EKSPRES' : 'STANDART',
      };

      // Test modunda mock yanıt
      const mockTrackingNumber = `MNG${Date.now()}`;
      this.logger.log(
        `[TEST MODE] MNG shipment created: ${mockTrackingNumber}`,
      );

      return {
        success: true,
        trackingNumber: mockTrackingNumber,
        estimatedDelivery: new Date(
          Date.now() + (request.isExpress ? 1 : 2) * 24 * 60 * 60 * 1000,
        ),
        rawResponse: { testMode: true, requestBody },
      };
    } catch (error: any) {
      this.logger.error('MNG createShipment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStatus(trackingNumber: string): Promise<TrackingResponse> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      return {
        success: false,
        trackingNumber,
        isDelivered: false,
        history: [],
        error: 'MNG Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] MNG tracking query: ${trackingNumber}`);

      return {
        success: true,
        trackingNumber,
        currentStatus: 'OUT_FOR_DELIVERY',
        currentLocation: 'Kadıköy Dağıtım',
        isDelivered: false,
        history: [
          {
            status: 'SHIPPED',
            description: 'Gönderi kabul edildi',
            location: 'Merkez Şube',
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
          },
          {
            status: 'IN_TRANSIT',
            description: 'Transfer merkezinde',
            location: 'İstanbul Aktarma',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
          {
            status: 'OUT_FOR_DELIVERY',
            description: 'Dağıtıma çıktı',
            location: 'Kadıköy Dağıtım',
            timestamp: new Date(),
          },
        ],
        rawResponse: { testMode: true },
      };
    } catch (error: any) {
      this.logger.error('MNG getStatus error:', error);
      return {
        success: false,
        trackingNumber,
        isDelivered: false,
        history: [],
        error: error.message,
      };
    }
  }

  async getLabel(trackingNumber: string): Promise<LabelResponse> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      return {
        success: false,
        error: 'MNG Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] MNG label request: ${trackingNumber}`);

      return {
        success: true,
        labelUrl: `/api/shipping/labels/${trackingNumber}.pdf`,
      };
    } catch (error: any) {
      this.logger.error('MNG getLabel error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async cancelShipment(
    trackingNumber: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      return {
        success: false,
        error: 'MNG Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] MNG shipment cancelled: ${trackingNumber}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error('MNG cancelShipment error:', error);
      return { success: false, error: error.message };
    }
  }

  async createReturn(
    originalTrackingNumber: string,
  ): Promise<ShipmentResponse> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      return {
        success: false,
        error: 'MNG Kargo API credentials not configured',
      };
    }

    try {
      const returnTrackingNumber = `MNGR${Date.now()}`;
      this.logger.log(
        `[TEST MODE] MNG return created: ${returnTrackingNumber}`,
      );

      return {
        success: true,
        trackingNumber: returnTrackingNumber,
        rawResponse: { testMode: true, originalTrackingNumber },
      };
    } catch (error: any) {
      this.logger.error('MNG createReturn error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
