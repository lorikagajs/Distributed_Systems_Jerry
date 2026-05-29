export interface OrderConfirmationEmailItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface OrderConfirmationTenantBranding {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
}

/** Payload enqueued after a successful order placement. */
export interface OrderConfirmationEmailJobPayload {
  customerEmail: string;
  customerName: string;
  orderId: number;
  orderTotal: number;
  currency: string;
  items: OrderConfirmationEmailItem[];
  tenant: OrderConfirmationTenantBranding;
}
