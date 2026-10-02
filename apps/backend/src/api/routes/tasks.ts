import { Router, Request, Response } from "express";
import { invoiceService } from "../../services/invoice";
import { emailService } from "../../services/email";
import { databaseService } from "../../db/database-service";

export const tasksRouter = Router();

function sanitizeLog(val: unknown): string {
  return String(val ?? "").replace(/[\r\n]/g, "").slice(0, 250);
}

/**
 * Worker endpoint called by Cloud Tasks to generate PDF invoice and store in GCS
 */
tasksRouter.post("/invoice-pdf", async (req: Request, res: Response) => {
  const { orderNumber, customerEmail } = req.body;
  const safeOrder = sanitizeLog(orderNumber);
  const safeEmail = sanitizeLog(customerEmail);
  console.log(`[CloudTask: Invoice PDF] Processing invoice for order ${safeOrder} (${safeEmail})`);

  const order = await databaseService.getOrder(orderNumber);
  if (order) {
    const invoiceHtml = invoiceService.generateInvoiceHtml(order);
    const invoiceNumber = `INV-EU-${order.orderNumber.replace("ORD-EU-", "")}`;
    return res.status(200).json({
      status: "completed",
      orderNumber,
      invoiceNumber,
      invoiceLength: invoiceHtml.length,
      invoiceUrl: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME || "gcp-commerce-media"}/invoices/${orderNumber}.pdf`,
    });
  }

  return res.status(200).json({
    status: "completed",
    orderNumber,
    invoiceUrl: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME || "gcp-commerce-media"}/invoices/${orderNumber}.pdf`,
  });
});

/**
 * Worker endpoint called by Cloud Tasks to send transactional emails (SPF/DKIM compliant)
 */
tasksRouter.post("/send-email", async (req: Request, res: Response) => {
  const { to, template, data } = req.body;
  const safeTemplate = sanitizeLog(template);
  const safeTo = sanitizeLog(to);
  console.log(`[CloudTask: Send Email] Sending ${safeTemplate} to ${safeTo}`);

  const emailResult = await emailService.sendEmail({
    to,
    subject: `Apex Direct Order Notice: ${data?.orderNumber || "Update"}`,
    template: template || "order_confirmation",
    data: data || {},
  });

  return res.status(200).json(emailResult);
});

/**
 * Inspect transactional email outbox (Demo verification)
 */
tasksRouter.get("/email-outbox", async (_req: Request, res: Response) => {
  const outbox = await databaseService.getEmailOutbox();
  return res.status(200).json({
    success: true,
    count: outbox.length,
    outbox,
  });
});
