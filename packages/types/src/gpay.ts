/**
 * Google Pay Web API Types
 */

export interface GooglePayButtonOptions {
  buttonColor?: "default" | "black" | "white";
  buttonType?: "buy" | "plain" | "order" | "pay" | "checkout";
  buttonSizeMode?: "static" | "fill";
  onClick: (event: unknown) => void;
}

export interface GooglePayTransactionInfo {
  totalPriceStatus: "FINAL" | "ESTIMATED";
  totalPrice: string;
  currencyCode: string;
  countryCode: string;
}

export interface GooglePayPaymentDataRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: Array<{
    type: "CARD";
    parameters: {
      allowedAuthMethods: string[];
      allowedCardNetworks: string[];
    };
    tokenizationSpecification: {
      type: "PAYMENT_GATEWAY";
      parameters: Record<string, string>;
    };
  }>;
  merchantInfo: {
    merchantId?: string;
    merchantName: string;
  };
  transactionInfo: GooglePayTransactionInfo;
}
