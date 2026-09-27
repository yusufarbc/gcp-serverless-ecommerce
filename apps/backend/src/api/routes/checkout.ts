import { Router, Request, Response } from "express";
import { UnionOssTaxService } from "../../modules/tax-provider/oss-tax-service";
import { GooglePayPaymentService } from "../../modules/payment-googlepay/googlepay-service";
import { PayPalPaymentService } from "../../modules/payment-paypal/paypal-service";
import { CustomsAndExportService } from "../../modules/furniture-logistics/customs-service";
import { TwoManHandlingDispatcher } from "../../modules/furniture-logistics/two-man-handling";
import { CloudTasksService } from "../../services/cloud-tasks";
import type { GenericOrder } from "@repo/types";

export const checkoutRouter = Router();
const ossTaxService = new UnionOssTaxService();
const googlePayService = new GooglePayPaymentService("stripe");
const payPalService = new PayPalPaymentService();
const customsService = new CustomsAndExportService();
const twoManDispatcher = new TwoManHandlingDispatcher();
const cloudTasksService = new CloudTasksService();

/**
 * Tax estimation route for live checkout updates as user inputs shipping address
 */
checkoutRouter.post("/calculate-tax", (req: Request, res: Response) => {
  const { subtotal, countryCode } = req.body;

  if (typeof subtotal !== "number" || !countryCode) {
    return res.status(400).json({ error: "subtotal (number) and countryCode (string) are required" });
  }

  const taxResult = ossTaxService.calculateTax(subtotal, countryCode);
  return res.status(200).json(taxResult);
});

/**
 * PayPal Checkout v2 Order Creation
 */
checkoutRouter.post("/paypal/create-order", async (req: Request, res: Response) => {
  try {
    const { amount, currency, customId } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount (number > 0) is required" });
    }
    const result = await payPalService.createOrder(amount, currency || "EUR", customId || "");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * PayPal Checkout v2 Order Capture
 */
checkoutRouter.post("/paypal/capture-order", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }
    const result = await payPalService.captureOrder(orderId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Complete order with Google Pay, PayPal, or standard checkout
 */
checkoutRouter.post("/process-order", async (req: Request, res: Response) => {
  try {
    const {
      cart,
      shippingAddress,
      billingAddress,
      paymentMethod,
      googlePayToken,
      paypalOrderId,
      logisticsDetails,
    } = req.body;

    if (!cart || !shippingAddress) {
      return res.status(400).json({ error: "cart and shippingAddress are required" });
    }

    // 1. Calculate dynamic Union OSS Tax
    const subtotal = cart.items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const taxCalc = ossTaxService.calculateTax(subtotal, shippingAddress.countryCode);
    
    // Generic dynamic shipping calculation (Free EU delivery over 100 EUR, or standard 9.90 EUR, or freight 89 EUR)
    const isBulky = cart.items.some((item: { parcels?: Array<{ weightKg: number }> }) =>
      item.parcels?.some((p) => p.weightKg > 30)
    );
    const shippingTotal = isBulky ? 89.0 : subtotal >= 100 ? 0.0 : 9.90;
    const grandTotal = Math.round((subtotal + taxCalc.taxAmount + shippingTotal) * 100) / 100;

    // 2. Process Payment (Google Pay Tokenization, PayPal, or Gateway)
    let transactionId = `txn_manual_${Date.now()}`;
    let paypalDetails = undefined;

    if (paymentMethod === "google_pay" && googlePayToken) {
      const paymentResult = await googlePayService.processPayment(
        googlePayToken,
        grandTotal,
        "EUR",
        `ORD_${Date.now()}`
      );
      if (!paymentResult.success) {
        return res.status(402).json({ error: "Google Pay verification failed", details: paymentResult.error });
      }
      transactionId = paymentResult.transactionId;
    } else if (paymentMethod === "paypal") {
      const idToCapture = paypalOrderId || `PAYPAL_${Date.now()}`;
      const captureResult = await payPalService.captureOrder(idToCapture);
      if (!captureResult.success) {
        return res.status(402).json({ error: "PayPal payment capture failed", details: captureResult.error });
      }
      transactionId = captureResult.captureId || idToCapture;
      paypalDetails = {
        orderId: captureResult.orderId,
        payerId: captureResult.payer?.payerId,
        payerEmail: captureResult.payer?.emailAddress,
        captureId: captureResult.captureId,
      };
    }

    // 3. Construct Generic Order Object
    const orderNumber = `ORD-EU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order: GenericOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      cartId: cart.id || "cart_temp",
      items: cart.items,
      customerEmail: shippingAddress.email,
      customerPhone: shippingAddress.phone,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || "google_pay",
      paymentTransactionId: transactionId,
      paypalDetails,
      subtotal,
      taxTotal: taxCalc.taxAmount,
      shippingTotal,
      total: grandTotal,
      currency: "EUR",
      status: "processing",
      logistics: logisticsDetails,
      createdAt: new Date().toISOString(),
    };

    // 4. Generate Customs & Logistics Documents
    const atrData = customsService.generateAtrCertificateData(order);
    const packingList = customsService.generatePackingList(order);

    // 5. Dispatch to logistics carrier network (DHL Express / Rhenus)
    const carrierDispatch = await twoManDispatcher.dispatchOrder(order, logisticsDetails || {});

    // 6. Asynchronously trigger Cloud Tasks (Invoice PDF, Email Notification)
    await cloudTasksService.enqueueTask({
      endpoint: "/api/tasks/invoice-pdf",
      payload: { orderNumber: order.orderNumber, customerEmail: order.customerEmail },
    });

    await cloudTasksService.enqueueTask({
      endpoint: "/api/tasks/send-email",
      payload: {
        to: order.customerEmail,
        template: "order_confirmation",
        data: { orderNumber: order.orderNumber, total: order.total },
      },
    });

    return res.status(201).json({
      success: true,
      order,
      customs: {
        atrDeclaration: atrData,
        packingList,
      },
      logistics: carrierDispatch,
      ossTax: taxCalc,
    });
  } catch (error) {
    console.error("[Checkout Error]:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
});
