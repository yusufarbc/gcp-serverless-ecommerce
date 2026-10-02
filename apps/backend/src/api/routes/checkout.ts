import { Router, Request, Response } from "express";
import crypto from "crypto";
import { UnionOssTaxService } from "../../modules/tax-provider/oss-tax-service";
import { GooglePayPaymentService } from "../../modules/payment-googlepay/googlepay-service";
import { PayPalPaymentService } from "../../modules/payment-paypal/paypal-service";
import { stripeService } from "../../modules/payment-stripe/stripe-service";
import { CustomsAndExportService } from "../../modules/crossborder-logistics/customs-service";
import { TwoManHandlingDispatcher } from "../../modules/crossborder-logistics/two-man-handling";
import { CloudTasksService } from "../../services/cloud-tasks";
import { databaseService } from "../../db/database-service";
import { invoiceService } from "../../services/invoice";
import { emailService } from "../../services/email";
import { adminAuthMiddleware, orderAccessMiddleware } from "../../middleware/auth";
import { idempotencyService } from "../../services/idempotency";
import type { GenericOrder, CartItem } from "@repo/types";

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
 * Stripe PaymentIntent Creation (Cards, iDEAL, Klarna)
 */
checkoutRouter.post("/stripe/create-payment-intent", async (req: Request, res: Response) => {
  try {
    const { amount, currency, metadata } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "amount (number > 0) is required" });
    }
    const result = await stripeService.createPaymentIntent(amount, currency || "EUR", metadata || {});
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
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
 * Complete order with Google Pay, PayPal, Stripe, or standard checkout
 * Implements:
 * 1. Server-Side Price & Product Verification (Prevents Price Tampering)
 * 2. Idempotency Key Handling (Prevents Duplicate Payments & Request Storms)
 * 3. Cryptographic Order Access Token Generation (Prevents BOLA / IDOR)
 */
checkoutRouter.post("/process-order", async (req: Request, res: Response) => {
  const idempotencyKey =
    (req.headers["idempotency-key"] as string) || (req.body?.idempotencyKey as string) || "";

  if (idempotencyKey) {
    const existing = idempotencyService.get(idempotencyKey);
    if (existing) {
      if (existing.status === "in_progress") {
        return res.status(409).json({
          error: "A checkout request with this Idempotency-Key is currently being processed. Please wait.",
          code: "IDEMPOTENCY_IN_PROGRESS",
        });
      }
      if (existing.status === "completed") {
        res.setHeader("Idempotent-Replay", "true");
        return res.status(existing.statusCode || 200).json(existing.body);
      }
    }

    const locked = idempotencyService.lock(idempotencyKey);
    if (!locked) {
      return res.status(409).json({
        error: "A checkout request with this Idempotency-Key is currently being processed.",
        code: "IDEMPOTENCY_LOCKED",
      });
    }
  }

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

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0 || !shippingAddress) {
      if (idempotencyKey) idempotencyService.release(idempotencyKey);
      return res.status(400).json({ error: "cart (with non-empty items array) and shippingAddress are required" });
    }

    // 1. Authoritative Server-Side Product & Price Validation (Remediates Client-Side Price Tampering)
    const verifiedItems: CartItem[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const { productId, variantId, quantity } = item;
      const qty = Number(quantity);

      if (!productId || !variantId || !Number.isInteger(qty) || qty <= 0 || qty > 100) {
        if (idempotencyKey) idempotencyService.release(idempotencyKey);
        return res.status(400).json({
          error: `Invalid cart item parameters for productId=${productId}, variantId=${variantId}, quantity=${quantity}`,
        });
      }

      // Fetch canonical product and variant directly from server catalog / database
      const catalogRecord = await databaseService.getProductVariant(productId, variantId);
      if (!catalogRecord) {
        if (idempotencyKey) idempotencyService.release(idempotencyKey);
        return res.status(400).json({
          error: `Product or variant not found in official catalog: productId=${productId}, variantId=${variantId}`,
        });
      }

      const { product, variant } = catalogRecord;

      // Price and parcel specifications MUST come strictly from server source-of-truth
      const authoritativePrice = variant.price;
      const itemSubtotal = Math.round(authoritativePrice * qty * 100) / 100;
      subtotal = Math.round((subtotal + itemSubtotal) * 100) / 100;

      verifiedItems.push({
        productId: product.id,
        variantId: variant.id,
        title: product.title.en || variant.title,
        price: authoritativePrice, // Verified server price
        quantity: qty,
        parcels: variant.parcels || [], // Verified server parcel dimensions
      });
    }

    // 2. Calculate dynamic Union OSS Tax from server-verified subtotal
    const taxCalc = ossTaxService.calculateTax(subtotal, shippingAddress.countryCode);

    // Generic dynamic shipping calculation strictly based on verified parcel data
    const isBulky = verifiedItems.some((item) =>
      item.parcels?.some((p) => p.weightKg > 30)
    );
    const shippingTotal = isBulky ? 89.0 : subtotal >= 100 ? 0.0 : 9.90;
    const grandTotal = Math.round((subtotal + taxCalc.taxAmount + shippingTotal) * 100) / 100;

    // 3. Process Payment (Google Pay Tokenization, PayPal, or Gateway)
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
        if (idempotencyKey) idempotencyService.release(idempotencyKey);
        return res.status(402).json({ error: "Google Pay verification failed", details: paymentResult.error });
      }
      transactionId = paymentResult.transactionId;
    } else if (paymentMethod === "paypal") {
      const idToCapture = paypalOrderId || `PAYPAL_${Date.now()}`;
      const captureResult = await payPalService.captureOrder(idToCapture);
      if (!captureResult.success) {
        if (idempotencyKey) idempotencyService.release(idempotencyKey);
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

    // 4. Construct Generic Order Object with Cryptographic Access Token (Remediates BOLA / IDOR)
    const orderNumber = `ORD-EU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const accessToken = crypto.randomBytes(32).toString("hex");

    const order: GenericOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      accessToken, // Unguessable 256-bit token for guest verification & invoice access
      cartId: cart.id || "cart_temp",
      items: verifiedItems,
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

    // 5. Persist in Database Service
    await databaseService.saveOrder(order);

    // 6. Generate Customs & Logistics Documents
    const atrData = customsService.generateAtrCertificateData(order);
    const packingList = customsService.generatePackingList(order);
    const carrierDispatch = await twoManDispatcher.dispatchOrder(order, logisticsDetails || {});

    // 7. Trigger Simulated Email Confirmation & Enqueue Tasks
    await emailService.sendOrderConfirmation(order);

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

    const invoicePreviewUrl = `/api/checkout/orders/${order.orderNumber}/invoice?token=${accessToken}`;

    const responsePayload = {
      success: true,
      order,
      accessToken,
      invoicePreviewUrl,
      customs: {
        atrDeclaration: atrData,
        packingList,
      },
      logistics: carrierDispatch,
      ossTax: taxCalc,
    };

    if (idempotencyKey) {
      idempotencyService.complete(idempotencyKey, 201, responsePayload);
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    if (idempotencyKey) {
      idempotencyService.release(idempotencyKey);
    }
    console.error("[Checkout Error]:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * List all orders in database
 * Restricted to authenticated Admin to prevent BOLA / IDOR enumeration
 */
checkoutRouter.get("/orders", adminAuthMiddleware, async (_req: Request, res: Response) => {
  const orders = await databaseService.listOrders();
  return res.status(200).json({ success: true, count: orders.length, orders });
});

/**
 * Retrieve single order by orderNumber
 * Protected by orderAccessMiddleware (requires valid accessToken or Admin authorization)
 */
checkoutRouter.get("/orders/:orderNumber", orderAccessMiddleware, async (req: Request, res: Response) => {
  const order = (req as any).order || (await databaseService.getOrder(req.params.orderNumber));
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  return res.status(200).json({ success: true, order });
});

/**
 * Render printable EU VAT Invoice for order
 * Protected by orderAccessMiddleware (requires valid accessToken or Admin authorization)
 */
checkoutRouter.get("/orders/:orderNumber/invoice", orderAccessMiddleware, async (req: Request, res: Response) => {
  const order = (req as any).order || (await databaseService.getOrder(req.params.orderNumber));
  if (!order) {
    return res.status(404).send("Order not found");
  }

  const format = req.query.format;
  if (format === "json") {
    const details = invoiceService.buildInvoiceData(order);
    return res.status(200).json(details);
  }

  const html = invoiceService.generateInvoiceHtml(order);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
});
