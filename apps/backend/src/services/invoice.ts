import type { GenericOrder } from "@repo/types";

export interface InvoiceDetails {
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  seller: {
    companyName: string;
    address: string;
    city: string;
    country: string;
    vatId: string;
    taxOffice: string;
    commercialRegister: string;
    iban: string;
    bic: string;
  };
  customer: {
    name: string;
    company?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPriceNet: number;
    vatRatePercent: number;
    vatAmount: number;
    totalGross: number;
  }>;
  subtotalNet: number;
  vatRatePercent: number;
  vatTotal: number;
  shippingGross: number;
  totalGross: number;
  currency: string;
  isOssApplicable: boolean;
}

export class InvoiceService {
  private seller = {
    companyName: process.env.COMPANY_NAME || "Apex Direct Europe GmbH",
    address: process.env.COMPANY_ADDRESS || "Friedrichstraße 123",
    city: process.env.COMPANY_CITY || "10117 Berlin",
    country: "Deutschland / Germany",
    vatId: process.env.EU_OSS_VAT_ID || "DE345678901", // Placeholder VAT ID
    taxOffice: "Finanzamt Berlin für Körperschaften",
    commercialRegister: "HRB 198765 B (Amtsgericht Charlottenburg)",
    iban: process.env.BANK_IBAN || "DE89370400440532013000",
    bic: process.env.BANK_BIC || "DBEUMM21BER",
  };

  /**
   * Builds invoice data structure from GenericOrder
   */
  public buildInvoiceData(order: GenericOrder): InvoiceDetails {
    const invoiceNumber = `INV-EU-${order.orderNumber.replace("ORD-EU-", "")}`;
    const issueDate = new Date(order.createdAt).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const isDomestic = order.shippingAddress.countryCode === "DE";
    const vatRatePercent = order.subtotal > 0 ? Math.round((order.taxTotal / order.subtotal) * 100) : 19;
    const subtotalNet = Math.round((order.subtotal / (1 + vatRatePercent / 100)) * 100) / 100;
    const vatTotal = Math.round((order.subtotal - subtotalNet) * 100) / 100;

    const items = order.items.map((item) => {
      const grossItemTotal = item.price * item.quantity;
      const netItemTotal = Math.round((grossItemTotal / (1 + vatRatePercent / 100)) * 100) / 100;
      const itemVat = Math.round((grossItemTotal - netItemTotal) * 100) / 100;
      return {
        description: item.title,
        quantity: item.quantity,
        unitPriceNet: Math.round((item.price / (1 + vatRatePercent / 100)) * 100) / 100,
        vatRatePercent,
        vatAmount: itemVat,
        totalGross: grossItemTotal,
      };
    });

    return {
      invoiceNumber,
      orderNumber: order.orderNumber,
      issueDate,
      seller: this.seller,
      customer: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        company: order.shippingAddress.company,
        address: order.shippingAddress.address1 || order.shippingAddress.addressLine1 || "",
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.countryCode,
        email: order.customerEmail,
      },
      items,
      subtotalNet,
      vatRatePercent,
      vatTotal: order.taxTotal,
      shippingGross: order.shippingTotal,
      totalGross: order.total,
      currency: order.currency || "EUR",
      isOssApplicable: !isDomestic,
    };
  }

  /**
   * Generates a modern, printable EU VAT Invoice HTML document
   */
  public generateInvoiceHtml(order: GenericOrder): string {
    const inv = this.buildInvoiceData(order);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.invoiceNumber} - ${inv.seller.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #1f2937; background: #f9fafb; font-size: 14px; line-height: 1.5; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 24px; margin-bottom: 32px; }
    .brand h1 { margin: 0; font-size: 24px; font-weight: 800; color: #111827; }
    .brand p { margin: 4px 0 0; font-size: 12px; color: #6b7280; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { margin: 0; font-size: 20px; color: #111827; }
    .meta-line { margin: 4px 0; font-size: 13px; color: #4b5563; }
    .address-section { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .seller-box, .customer-box { font-size: 13px; }
    .box-title { font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { text-align: left; padding: 10px 12px; background: #f3f4f6; font-size: 12px; font-weight: 700; color: #374151; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 340px; margin-bottom: 36px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
    .totals-row.grand-total { border-top: 2px solid #111827; font-size: 16px; font-weight: 800; color: #111827; padding-top: 10px; margin-top: 6px; }
    .eu-legal-notice { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; font-size: 12px; color: #1e40af; margin-bottom: 32px; line-height: 1.6; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.6; }
    @media print { body { background: white; padding: 0; } .invoice-card { box-shadow: none; border: none; padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px; text-align: right;">
    <button onclick="window.print()" style="background: #111827; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div class="brand">
        <h1>${inv.seller.companyName}</h1>
        <p>Pan-European D2C Fulfillment Hub • Berlin, Germany</p>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <div class="meta-line"><strong>Invoice No:</strong> ${inv.invoiceNumber}</div>
        <div class="meta-line"><strong>Order No:</strong> ${inv.orderNumber}</div>
        <div class="meta-line"><strong>Date:</strong> ${inv.issueDate}</div>
        <div class="meta-line"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()} (ID: ${order.paymentTransactionId})</div>
      </div>
    </div>

    <div class="address-section">
      <div class="seller-box">
        <div class="box-title">Issuer (Seller)</div>
        <strong>${inv.seller.companyName}</strong><br>
        ${inv.seller.address}<br>
        ${inv.seller.city}, ${inv.seller.country}<br>
        USt-IdNr. (EU VAT): <strong>${inv.seller.vatId}</strong><br>
        Register: ${inv.seller.commercialRegister}
      </div>
      <div class="customer-box">
        <div class="box-title">Bill To / Deliver To</div>
        <strong>${inv.customer.name}</strong><br>
        ${inv.customer.company ? `${inv.customer.company}<br>` : ""}
        ${inv.customer.address}<br>
        ${inv.customer.postalCode} ${inv.customer.city}<br>
        Country Code: <strong>${inv.customer.country}</strong><br>
        Email: ${inv.customer.email}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th class="text-right" style="width: 100px;">Net Unit</th>
          <th style="width: 80px; text-align: center;">VAT Rate</th>
          <th class="text-right" style="width: 90px;">VAT</th>
          <th class="text-right" style="width: 100px;">Gross Total</th>
        </tr>
      </thead>
      <tbody>
        ${inv.items
          .map(
            (item) => `<tr>
          <td><strong>${item.description}</strong></td>
          <td style="text-align: center;">${item.quantity}</td>
          <td class="text-right">${item.unitPriceNet.toFixed(2)} ${inv.currency}</td>
          <td style="text-align: center;">${item.vatRatePercent}%</td>
          <td class="text-right">${item.vatAmount.toFixed(2)} ${inv.currency}</td>
          <td class="text-right">${item.totalGross.toFixed(2)} ${inv.currency}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal (Net):</span>
        <span>${inv.subtotalNet.toFixed(2)} ${inv.currency}</span>
      </div>
      <div class="totals-row">
        <span>EU OSS VAT (${inv.vatRatePercent}% - ${inv.customer.country}):</span>
        <span>${inv.vatTotal.toFixed(2)} ${inv.currency}</span>
      </div>
      <div class="totals-row">
        <span>Shipping (Express EU Delivery):</span>
        <span>${inv.shippingGross === 0 ? "FREE (€ 0.00)" : `${inv.shippingGross.toFixed(2)} ${inv.currency}`}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Total Paid:</span>
        <span>${inv.totalGross.toFixed(2)} ${inv.currency}</span>
      </div>
    </div>

    <div class="eu-legal-notice">
      <strong>EU Tax & Regulatory Compliance:</strong><br>
      ${
        inv.isOssApplicable
          ? `Supplied under the European Union One-Stop Shop (EU OSS) scheme pursuant to EU Council Directive 2006/112/EC. VAT is declared and remitted directly to the destination EU Member State (${inv.customer.country}) via the Federal Central Tax Office (BZSt).`
          : `German domestic supply subject to standard statutory value-added tax (UStG § 1).`
      }<br>
      <em>Consumers enjoy a statutory 14-day right of withdrawal from date of delivery under EU Directive 2011/83/EU.</em>
    </div>

    <div class="footer">
      ${inv.seller.companyName} • ${inv.seller.address}, ${inv.seller.city} • USt-IdNr.: ${inv.seller.vatId}<br>
      Bank: ${inv.seller.iban} • BIC: ${inv.seller.bic} • Court of Registration: ${inv.seller.commercialRegister}
    </div>
  </div>
</body>
</html>`;
  }
}

export const invoiceService = new InvoiceService();
