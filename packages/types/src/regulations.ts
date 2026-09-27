/**
 * EU Regulations & Cross-Border Logistics Domain Models
 */

// EUDR (Regulation (EU) 2023/1115 - Deforestation Regulation)
export interface EudrMetadata {
  isWoodProduct: boolean;
  scientificTreeSpecies?: string;
  countryOfHarvest?: string;
  forestGpsCoordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  tracesNtReference?: string;
  fscOrPefcCertificateNumber?: string;
}

// Multi-box / Parcel Desi and Dimensions for Freight Logistics
export interface ParcelItem {
  boxNumber: number;
  boxDescription: string; // e.g. "Headboard", "Base", "Hardware"
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  desi: number; // (L * W * H) / 3000 or / 5000 depending on carrier
  barcode?: string;
}

// GPSR (Regulation (EU) 2023/988 - General Product Safety Regulation)
export interface GpsrResponsiblePerson {
  companyName: string;
  legalRepresentative: string;
  addressLine1: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone?: string;
}

// Omnibus Directive (Directive (EU) 2019/2161 - Price Reductions)
export interface OmnibusPriceHistory {
  lowestPriceLast30Days: number;
  currency: string;
  validFrom: string; // ISO Date
  validTo: string;
}

// Customs & Export Documentation Data
export interface CustomsMetadata {
  hsCode: string; // Armonize Sistem / GTIP kodu (e.g., 9401.61.00 for upholstered wood seats)
  countryOfOrigin: string; // "TR"
  atrEligible: boolean; // Turkey-EU Customs Union A.TR Certificate eligibility
  grossWeightKg: number;
  netWeightKg: number;
  packagesCount: number;
}

// Two-Man Handling & Freight Logistics Info
export interface TwoManLogisticsDetails {
  floorNumber?: number;
  hasElevator?: boolean;
  needsAssembly?: boolean;
  preferredTimeWindow?: string;
  carrierPartner?: "rhenus" | "dachser" | "generic";
  trackingNumber?: string;
  trackingUrl?: string;
}

// Dynamic EU VAT Rates (Union OSS - Directive 2006/112/EC)
export const EU_STANDARD_VAT_RATES: Record<string, number> = {
  DE: 0.19, // Germany
  AT: 0.20, // Austria
  FR: 0.20, // France
  NL: 0.21, // Netherlands
  BE: 0.21, // Belgium
  IT: 0.22, // Italy
  ES: 0.21, // Spain
  PT: 0.23, // Portugal
  PL: 0.23, // Poland
  CZ: 0.21, // Czech Republic
  DK: 0.25, // Denmark
  SE: 0.25, // Sweden
  FI: 0.255, // Finland
  IE: 0.23, // Ireland
  LU: 0.17, // Luxembourg
};
