export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  gateway: "stripe" | "mollie";
  error?: string;
}

export class GooglePayPaymentService {
  constructor(private gateway: "stripe" | "mollie" = "stripe") {}

  public async processPayment(
    paymentToken: string,
    amount: number,
    currency = "EUR",
    orderId: string
  ): Promise<PaymentResult> {
    const transactionId = `txn_${this.gateway}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return { success: true, transactionId, amount, currency, gateway: this.gateway };
  }
}
