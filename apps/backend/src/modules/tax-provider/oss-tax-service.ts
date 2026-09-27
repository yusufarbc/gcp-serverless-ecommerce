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

export class UnionOssTaxService {
  public calculateTax(subtotal: number, countryCode: string) {
    const normalizedCountry = countryCode.toUpperCase();
    const rate = EU_STANDARD_VAT_RATES[normalizedCountry];
    if (rate !== undefined) {
      const taxAmount = Math.round(subtotal * rate * 100) / 100;
      return { countryCode: normalizedCountry, vatRate: rate, subtotal, taxAmount, totalWithTax: Math.round((subtotal + taxAmount) * 100) / 100, isOssApplicable: true };
    }
    return { countryCode: normalizedCountry, vatRate: 0, subtotal, taxAmount: 0, totalWithTax: subtotal, isOssApplicable: false };
  }
}
