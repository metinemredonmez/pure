export interface ShipmentRequest {
  orderId: string;
  orderNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderDistrict: string;
  senderPostalCode: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientDistrict: string;
  recipientPostalCode: string;
  weight: number; // kg
  desi?: number;
  itemCount: number;
  itemDescription?: string;
  totalValue: number;
  isExpress?: boolean;
}

export interface ShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  error?: string;
  rawResponse?: any;
}

export interface TrackingStatus {
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface TrackingResponse {
  success: boolean;
  trackingNumber: string;
  currentStatus?: string;
  currentLocation?: string;
  isDelivered: boolean;
  deliveredAt?: Date;
  history: TrackingStatus[];
  error?: string;
  rawResponse?: any;
}

export interface LabelResponse {
  success: boolean;
  labelPdf?: Buffer;
  labelUrl?: string;
  error?: string;
}

export interface CarrierInterface {
  /**
   * Create a new shipment
   */
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;

  /**
   * Get tracking status and history
   */
  getStatus(trackingNumber: string): Promise<TrackingResponse>;

  /**
   * Get shipping label as PDF
   */
  getLabel(trackingNumber: string): Promise<LabelResponse>;

  /**
   * Cancel a shipment
   */
  cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Create a return shipment
   */
  createReturn(originalTrackingNumber: string): Promise<ShipmentResponse>;
}
