import {
  EudrMetadata,
  ParcelItem,
  GpsrResponsiblePerson,
  OmnibusPriceHistory,
  CustomsMetadata,
  TwoManLogisticsDetails,
} from "./regulations";

export type SupportedLocale = "de" | "fr" | "nl" | "en";

export interface LocalizedString {
  de: string;
  fr?: string;
  nl?: string;
  en: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  altText?: string;
  is3dModel?: boolean; // .usdz or .gltf
  modelFormat?: "usdz" | "gltf" | "glb";
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  barcode?: string; // EAN-13 / GTIN
  price: number;
  originalPrice?: number;
  inventoryQuantity: number;
  parcels: ParcelItem[];
  customs: CustomsMetadata;
}

export interface GenericProduct {
  id: string;
  handle: string;
  title: LocalizedString;
  description: LocalizedString;
  brand: string;
  category: string;
  media: ProductMedia[];
  variants: ProductVariant[];
  eudr?: EudrMetadata;
  gpsr?: GpsrResponsiblePerson;
  omnibus?: OmnibusPriceHistory;
  defaultHsCode: string;
  material?: string;
  assemblyRequired: boolean;
  returnPolicyDays: number;
  estimatedReturnCostEur?: number; // German BGB § 357(5) bulky item return notice
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  parcels: ParcelItem[];
}

export interface CartAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  countryCode: string; // ISO 2-letter: "DE", "FR", "NL", etc.
  phone: string;
  email: string;
}

export interface GenericCart {
  id: string;
  items: CartItem[];
  shippingAddress?: CartAddress;
  billingAddress?: CartAddress;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  locale: SupportedLocale;
  logisticsDetails?: TwoManLogisticsDetails;
}

export interface GenericOrder {
  id: string;
  orderNumber: string;
  cartId: string;
  items: CartItem[];
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: CartAddress;
  billingAddress: CartAddress;
  paymentMethod: "google_pay" | "card" | "ideal" | "bancontact" | "klarna" | "paypal";
  paymentTransactionId: string;
  paypalDetails?: {
    orderId: string;
    payerId?: string;
    payerEmail?: string;
    captureId?: string;
  };
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  customsDocuments?: {
    atrPdfUrl?: string;
    commercialInvoicePdfUrl?: string;
    packingListPdfUrl?: string;
  };
  logistics?: TwoManLogisticsDetails;
  createdAt: string;
}
