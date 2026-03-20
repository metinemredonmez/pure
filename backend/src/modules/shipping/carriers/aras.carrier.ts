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
export class ArasCarrier implements CarrierInterface {
  private readonly logger = new Logger(ArasCarrier.name);
  private readonly baseUrl = 'https://customerservices.araskargo.com.tr';

  constructor(private settings: IntegrationSettingsService) {}

  private async getCredentials() {
    const apiKey = await this.settings.get('aras_api_key');
    return { apiKey };
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    const { apiKey } = await this.getCredentials();

    if (!apiKey) {
      this.logger.warn('Aras credentials not configured');
      return {
        success: false,
        error: 'Aras Kargo API credentials not configured',
      };
    }

    try {
      // Aras REST API çağrısı
      const requestBody = {
        apiKey,
        orderId: request.orderNumber,
        receiver: {
          name: request.recipientName,
          phone: request.recipientPhone,
          address: request.recipientAddress,
          city: request.recipientCity,
          district: request.recipientDistrict,
          postalCode: request.recipientPostalCode,
        },
        cargo: {
          count: request.itemCount,
          weight: request.weight,
          desi: request.desi || Math.ceil(request.weight),
          value: request.totalValue,
          description: request.itemDescription || 'Kahve ürünleri',
        },
        paymentType: 'SENDER',
      };

      // Test modunda mock yanıt
      const mockTrackingNumber = `AR${Date.now()}`;
      this.logger.log(
        `[TEST MODE] Aras shipment created: ${mockTrackingNumber}`,
      );

      return {
        success: true,
        trackingNumber: mockTrackingNumber,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün
        rawResponse: { testMode: true, requestBody },
      };
    } catch (error: any) {
      this.logger.error('Aras createShipment error:', error);
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
        error: 'Aras Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] Aras tracking query: ${trackingNumber}`);

      return {
        success: true,
        trackingNumber,
        currentStatus: 'IN_TRANSIT',
        currentLocation: 'Ankara Dağıtım Merkezi',
        isDelivered: false,
        history: [
          {
            status: 'SHIPPED',
            description: 'Kargo teslim alındı',
            location: 'İstanbul Şubesi',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
          {
            status: 'IN_TRANSIT',
            description: 'Dağıtım merkezinde',
            location: 'Ankara Dağıtım Merkezi',
            timestamp: new Date(),
          },
        ],
        rawResponse: { testMode: true },
      };
    } catch (error: any) {
      this.logger.error('Aras getStatus error:', error);
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
        error: 'Aras Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] Aras label request: ${trackingNumber}`);

      return {
        success: true,
        labelUrl: `/api/shipping/labels/${trackingNumber}.pdf`,
      };
    } catch (error: any) {
      this.logger.error('Aras getLabel error:', error);
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
        error: 'Aras Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] Aras shipment cancelled: ${trackingNumber}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error('Aras cancelShipment error:', error);
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
        error: 'Aras Kargo API credentials not configured',
      };
    }

    try {
      const returnTrackingNumber = `ARR${Date.now()}`;
      this.logger.log(
        `[TEST MODE] Aras return created: ${returnTrackingNumber}`,
      );

      return {
        success: true,
        trackingNumber: returnTrackingNumber,
        rawResponse: { testMode: true, originalTrackingNumber },
      };
    } catch (error: any) {
      this.logger.error('Aras createReturn error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
