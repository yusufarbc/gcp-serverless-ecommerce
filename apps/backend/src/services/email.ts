import type { GenericOrder } from "@repo/types";
import { databaseService, EmailOutboxItem } from "../db/database-service";

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: "order_confirmation" | "shipping_update" | "support_reply";
  data: Record<string, any>;
}

export class EmailService {
  private resendApiKey: string;
  private sendGridApiKey: string;
  private fromEmail: string;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || "";
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || "";
    this.fromEmail = process.env.FROM_EMAIL || "orders@apexstore.eu";
  }

  private isPlaceholderKey(key: string): boolean {
    return (
      !key ||
      key.includes("placeholder") ||
      key.includes("PLACEHOLDER") ||
      key.startsWith("re_placeholder") ||
      key.startsWith("SG.placeholder")
    );
  }

  /**
   * Generates localized HTML template for transactional emails
   */
  private renderHtmlTemplate(options: SendEmailOptions): string {
    const { template, data } = options;

    if (template === "order_confirmation") {
      const order: GenericOrder = data.order || {
        orderNumber: data.orderNumber || "ORD-EU-2026-XXXX",
        total: data.total || 0,
        currency: "EUR",
        items: [],
      };

      return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1f2937;background:#f3f4f6;padding:24px;}</style></head>
<body>
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e5e7eb;">
    <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:16px;">Apex Direct Europe</div>
    <div style="font-size:16px;color:#166534;font-weight:700;margin-bottom:12px;">🎉 Order Confirmed! (Ref: ${order.orderNumber})</div>
    <p>Thank you for shopping with us! We have received your order and our automated fulfillment facility in Frankfurt is currently preparing your parcel.</p>
    <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:20px 0;">
      <div style="font-weight:700;margin-bottom:8px;">Order Summary:</div>
      <div>Total Paid: <strong>${order.total.toFixed(2)} ${order.currency}</strong> (incl. EU OSS VAT)</div>
      <div>Status: <strong>Processing • Ready for Logistics Carrier</strong></div>
    </div>
    <p style="font-size:12px;color:#6b7280;line-height:1.5;">
      You have a 14-day statutory right of withdrawal under EU Directive 2011/83/EU.<br>
      Apex Direct Europe GmbH • Friedrichstraße 123, 10117 Berlin • USt-IdNr: DE345678901
    </p>
  </div>
</body>
</html>`;
    }

    if (template === "shipping_update") {
      return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:24px;color:#1f2937;">
  <h2>📦 Your parcel has been dispatched!</h2>
  <p>Order: <strong>${data.orderNumber}</strong></p>
  <p>Tracking Code (DHL Express Europe): <strong>${data.trackingNumber || "JJD014987239012"}</strong></p>
  <p>Estimated Delivery: 2-3 business days across continental Europe.</p>
</body>
</html>`;
    }

    // Default support reply
    return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;padding:24px;color:#1f2937;">
  <h2>Apex Direct Support Reply</h2>
  <p>Regarding your inquiry <strong>${data.ticketNumber || ""}</strong>:</p>
  <div style="background:#f9fafb;padding:16px;border-left:4px solid #2563eb;margin:16px 0;">
    ${data.replyText || data.message || ""}
  </div>
  <p style="font-size:12px;color:#6b7280;">Apex Direct Customer Operations Team</p>
</body>
</html>`;
  }

  /**
   * Dispatches transactional email (or simulates in demo mode)
   */
  public async sendEmail(options: SendEmailOptions): Promise<{
    status: "sent" | "simulated";
    provider: string;
    messageId: string;
  }> {
    const htmlContent = this.renderHtmlTemplate(options);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Check Resend
    if (!this.isPlaceholderKey(this.resendApiKey)) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [options.to],
            subject: options.subject,
            html: htmlContent,
          }),
        });
        if (res.ok) {
          const result = (await res.json()) as { id: string };
          return { status: "sent", provider: "resend", messageId: result.id };
        }
      } catch (err) {
        console.warn("[EmailService] Resend live dispatch error, falling back:", err);
      }
    }

    // Check SendGrid
    if (!this.isPlaceholderKey(this.sendGridApiKey)) {
      try {
        const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.sendGridApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: options.to }] }],
            from: { email: this.fromEmail, name: "Apex Direct Europe" },
            subject: options.subject,
            content: [{ type: "text/html", value: htmlContent }],
          }),
        });
        if (res.ok) {
          return { status: "sent", provider: "sendgrid", messageId };
        }
      } catch (err) {
        console.warn("[EmailService] SendGrid live dispatch error, falling back:", err);
      }
    }

    // Demo Simulation Mode (Logs & Records into outbox for zero-cost demo)
    console.log(
      `[EmailService: Demo Mode] 📧 Simulated email sent to "${options.to}" | Subject: "${options.subject}"`
    );

    const emailRecord: EmailOutboxItem = {
      id: messageId,
      to: options.to,
      subject: options.subject,
      template: options.template,
      htmlContent,
      sentAt: new Date().toISOString(),
      status: "simulated",
      provider: "demo_simulator",
    };

    await databaseService.recordEmail(emailRecord);

    return {
      status: "simulated",
      provider: "demo_simulator",
      messageId,
    };
  }

  public async sendOrderConfirmation(order: GenericOrder) {
    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber} (Apex Direct Europe)`,
      template: "order_confirmation",
      data: { order },
    });
  }
}

export const emailService = new EmailService();
