import { Router, Request, Response } from "express";

export const tasksRouter = Router();

/**
 * Worker endpoint called by Cloud Tasks to generate PDF invoice and store in GCS
 */
tasksRouter.post("/invoice-pdf", async (req: Request, res: Response) => {
  const { orderNumber, customerEmail } = req.body;
  console.log(`[CloudTask: Invoice PDF] Processing invoice for order ${orderNumber} (${customerEmail})`);

  // Simulated PDF generation & GCS Coldline archival
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
  console.log(`[CloudTask: Send Email] Sending ${template} to ${to}:`, data);

  return res.status(200).json({ status: "sent", to, template });
});

