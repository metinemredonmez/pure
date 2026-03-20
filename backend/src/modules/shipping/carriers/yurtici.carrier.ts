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
export class YurticiCarrier implements CarrierInterface {
  private readonly logger = new Logger(YurticiCarrier.name);
  private readonly baseUrl = 'https://ws.yurticikargo.com';

  constructor(private settings: IntegrationSettingsService) {}

  private async getCredentials() {
    const apiKey = await this.settings.get('yurtici_api_key');
    const apiPassword = await this.settings.get('yurtici_api_password');
    return { apiKey, apiPassword };
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    const { apiKey, apiPassword } = await this.getCredentials();

    if (!apiKey || !apiPassword) {
      this.logger.warn('Yurtiçi credentials not configured');
      return {
        success: false,
        error: 'Yurtiçi Kargo API credentials not configured',
      };
    }

    try {
      // Yurtiçi SOAP/REST API çağrısı
      // Gerçek implementasyon için Yurtiçi API dokümantasyonuna bakılmalı
      const requestBody = {
        UserName: apiKey,
        Password: apiPassword,
        ShipmentInfo: {
          CargoKey: request.orderNumber,
          InvoiceKey: request.orderNumber,
          ReceiverName: request.recipientName,
          ReceiverPhone: request.recipientPhone,
          ReceiverAddress: request.recipientAddress,
          ReceiverCity: request.recipientCity,
          ReceiverTown: request.recipientDistrict,
          ReceiverPostalCode: request.recipientPostalCode,
          CargoCount: request.itemCount,
          CargoWeight: request.weight,
          CargoValue: request.totalValue,
          PaymentType: 1, // 1=Gönderici öder
          Description: request.itemDescription || 'Kahve ürünleri',
        },
      };

      // Test modunda mock yanıt
      const mockTrackingNumber = `YK${Date.now()}`;
      this.logger.log(`[TEST MODE] Yurtiçi shipment created: ${mockTrackingNumber}`);

      return {
        success: true,
        trackingNumber: mockTrackingNumber,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün
        rawResponse: { testMode: true, requestBody },
      };
    } catch (error: any) {
      this.logger.error('Yurtiçi createShipment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStatus(trackingNumber: string): Promise<TrackingResponse> {
    const { apiKey, apiPassword } = await this.getCredentials();

    if (!apiKey || !apiPassword) {
      return {
        success: false,
        trackingNumber,
        isDelivered: false,
        history: [],
        error: 'Yurtiçi Kargo API credentials not configured',
      };
    }

    try {
      // Test modunda mock yanıt
      this.logger.log(`[TEST MODE] Yurtiçi tracking query: ${trackingNumber}`);

      return {
        success: true,
        trackingNumber,
        currentStatus: 'IN_TRANSIT',
        currentLocation: 'İstanbul Transfer Merkezi',
        isDelivered: false,
        history: [
          {
            status: 'SHIPPED',
            description: 'Kargo gönderildi',
            location: 'İstanbul Merkez',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            status: 'IN_TRANSIT',
            description: 'Transfer merkezinde',
            location: 'İstanbul Transfer Merkezi',
            timestamp: new Date(),
          },
        ],
        rawResponse: { testMode: true },
      };
    } catch (error: any) {
      this.logger.error('Yurtiçi getStatus error:', error);
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
    const { apiKey, apiPassword } = await this.getCredentials();

    if (!apiKey || !apiPassword) {
      return {
        success: false,
        error: 'Yurtiçi Kargo API credentials not configured',
      };
    }

    try {
      // Test modunda mock yanıt
      this.logger.log(`[TEST MODE] Yurtiçi label request: ${trackingNumber}`);

      return {
        success: true,
        labelUrl: `/api/shipping/labels/${trackingNumber}.pdf`,
      };
    } catch (error: any) {
      this.logger.error('Yurtiçi getLabel error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }> {
    const { apiKey, apiPassword } = await this.getCredentials();

    if (!apiKey || !apiPassword) {
      return {
        success: false,
        error: 'Yurtiçi Kargo API credentials not configured',
      };
    }

    try {
      this.logger.log(`[TEST MODE] Yurtiçi shipment cancelled: ${trackingNumber}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error('Yurtiçi cancelShipment error:', error);
      return { success: false, error: error.message };
    }
  }

  async createReturn(originalTrackingNumber: string): Promise<ShipmentResponse> {
    const { apiKey, apiPassword } = await this.getCredentials();

    if (!apiKey || !apiPassword) {
      return {
        success: false,
        error: 'Yurtiçi Kargo API credentials not configured',
      };
    }

    try {
      const returnTrackingNumber = `YKR${Date.now()}`;
      this.logger.log(`[TEST MODE] Yurtiçi return created: ${returnTrackingNumber}`);

      return {
        success: true,
        trackingNumber: returnTrackingNumber,
        rawResponse: { testMode: true, originalTrackingNumber },
      };
    } catch (error: any) {
      this.logger.error('Yurtiçi createReturn error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
