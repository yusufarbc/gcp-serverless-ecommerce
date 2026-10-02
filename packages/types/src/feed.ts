/**
 * Google Merchant Center (GMC) Next Product Feed Specification
 */

export interface GmcFeedItem {
  id: string; // SKU or unique product ID
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string[];
  price: string; // e.g. "1290.00 EUR"
  sale_price?: string;
  availability: "in_stock" | "out_of_stock" | "preorder";
  brand: string;
  gtin?: string; // EAN-13 barcode
  mpn?: string;
  condition?: "new" | "refurbished" | "used";
  google_product_category?: string;
  product_type?: string;
  shipping_weight?: string; // e.g. "45.00 kg"
  shipping_length?: string; // e.g. "180 cm"
  shipping_width?: string;
  shipping_height?: string;
  transit_time_label?: string; // e.g. "standard_express_eu"
  custom_label_0?: string; // e.g. "EU_COMPLIANT"
  custom_label_1?: string; // e.g. "HS_8518"
  custom_label_2?: string; // e.g. "STANDARD_PARCEL"
}

export interface GmcFeedConfig {
  storeName: string;
  storeUrl: string;
  feedDescription: string;
  defaultCurrency: string;
  gcsBucketName: string;
  fileName?: string;
}
