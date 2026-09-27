import { EU_STANDARD_VAT_RATES } from "@repo/types";

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
