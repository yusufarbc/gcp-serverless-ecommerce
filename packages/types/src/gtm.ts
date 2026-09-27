/**
 * GTM DataLayer, Consent Mode v2, and Server-Side GTM Telemetry Contracts
 */

export type ConsentStatus = "granted" | "denied";

export interface ConsentModeV2Config {
  ad_storage: ConsentStatus;
  analytics_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
  wait_for_update?: number;
}

export interface GtmUserData {
  email?: string;
  phone_number?: string;
  address?: {
    first_name?: string;
    last_name?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface GtmEcommerceItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

export interface GtmPurchaseEvent {
  event: "purchase";
  ecommerce: {
    transaction_id: string;
    value: number;
    tax?: number;
    shipping?: number;
    currency: string;
    coupon?: string;
    items: GtmEcommerceItem[];
  };
  user_data?: GtmUserData;
}

export interface GtmViewItemEvent {
  event: "view_item";
  ecommerce: {
    currency: string;
    value: number;
    items: GtmEcommerceItem[];
  };
}

export interface GtmAddToCartEvent {
  event: "add_to_cart";
  ecommerce: {
    currency: string;
    value: number;
    items: GtmEcommerceItem[];
  };
}

export interface GtmBeginCheckoutEvent {
  event: "begin_checkout";
  ecommerce: {
    currency: string;
    value: number;
    items: GtmEcommerceItem[];
  };
}
