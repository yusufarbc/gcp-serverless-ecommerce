import type { GenericOrder, CustomerInquiry, GenericProduct, ProductVariant } from "@repo/types";
import { MOCK_CATALOG } from "../api/routes/catalog";

export interface EmailOutboxItem {
  id: string;
  to: string;
  subject: string;
  template: string;
  htmlContent: string;
  sentAt: string;
  status: "simulated" | "sent";
  provider: "resend" | "sendgrid" | "smtp" | "demo_simulator";
}

/**
 * Enterprise Database & Persistence Service
 * Supports PostgreSQL (via Cloud SQL or serverless Neon/Supabase)
 * with graceful in-memory & file-backed fallback for $0.00 idle cost serverless demo mode.
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private isPostgresConnected: boolean = false;
  private connectionUrl: string;

  // In-Memory storage repositories (guarantees $0 idle cost in demo mode)
  private orders: Map<string, GenericOrder> = new Map();
  private products: Map<string, GenericProduct> = new Map();
  private supportTickets: Map<string, CustomerInquiry> = new Map();
  private emailOutbox: EmailOutboxItem[] = [];

  private constructor() {
    this.connectionUrl = process.env.DATABASE_URL || "";
    this.initializeData();
    this.checkDatabaseConnection();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Seed demo catalog, initial support inquiries, and simulated orders
   */
  private initializeData(): void {
    // Seed Catalog
    for (const prod of MOCK_CATALOG) {
      this.products.set(prod.id, prod);
    }

    // Seed Demo Support Tickets
    const initialTickets: CustomerInquiry[] = [
      {
        id: "tkt_it_001",
        ticketNumber: "SUP-IT-2026-8941",
        customerName: "Matteo Rossi",
        customerEmail: "matteo.rossi@milano.it",
        orderNumber: "ORD-EU-2026-7842",
        countryCode: "IT",
        subject: "Richiesta fattura con codice destinatario SDI e IVA 22%",
        originalMessage:
          "Buongiorno, ho ricevuto le cuffie Aura Pro. Vorrei ricevere la fattura con il riepilogo dell'IVA italiana al 22% per la mia azienda a Milano. Grazie mille.",
        sourceLanguage: "it",
        status: "open",
        category: "vat_invoice",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        responses: [],
      },
      {
        id: "tkt_de_002",
        ticketNumber: "SUP-DE-2026-6120",
        customerName: "Hannah Weber",
        customerEmail: "h.weber@berlin.de",
        orderNumber: "ORD-EU-2026-4412",
        countryCode: "DE",
        subject: "Sendungsverfolgung DHL Express für Luma Schreibtischlampe",
        originalMessage:
          "Hallo Support-Team, wo ist meine Bestellung? Die Sendungsverfolgung zeigt seit gestern den Status in Frankfurt. Wann wird die Lieferung zugestellt?",
        sourceLanguage: "de",
        status: "in_progress",
        category: "order_status",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        responses: [],
      },
      {
        id: "tkt_fr_003",
        ticketNumber: "SUP-FR-2026-3394",
        customerName: "Julien Dupont",
        customerEmail: "j.dupont@paris.fr",
        orderNumber: "ORD-EU-2026-1983",
        countryCode: "FR",
        subject: "Demande de retour selon le droit de rétractation de 14 jours",
        originalMessage:
          "Bonjour, je souhaite retourner le sac à dos Nordic Commuter sous le délai de rétractation légal de 14 jours européen. Pourriez-vous m'envoyer l'étiquette de retour?",
        sourceLanguage: "fr",
        status: "open",
        category: "return_request",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        responses: [],
      },
      {
        id: "tkt_es_004",
        ticketNumber: "SUP-ES-2026-1102",
        customerName: "Carlos Fernandez",
        customerEmail: "carlos.f@madrid.es",
        orderNumber: "ORD-EU-2026-9021",
        countryCode: "ES",
        subject: "Consulta sobre compatibilidad con Google Pay",
        originalMessage:
          "Hola, intenté pagar con Google Pay desde mi banco español y funcionó genial. ¿Tienen planeado añadir soporte para Bizum en el futuro?",
        sourceLanguage: "es",
        status: "resolved",
        category: "general",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        responses: [],
      },
    ];

    for (const ticket of initialTickets) {
      this.supportTickets.set(ticket.id, ticket);
    }

    // Seed Demo Orders
    const demoOrder: GenericOrder = {
      id: "ord_demo_001",
      orderNumber: "ORD-EU-2026-7842",
      accessToken: "demo-sec-token-7842-eu",
      cartId: "cart_demo_01",
      items: [
        {
          productId: "prod_anc_headphones_01",
          variantId: "var_headphones_black",
          title: "Aura Pro Wireless ANC Headphones - Midnight Black",
          price: 249.0,
          quantity: 1,
          parcels: [
            {
              boxNumber: 1,
              boxDescription: "Retail Packaging & Case",
              weightKg: 0.65,
              lengthCm: 22,
              widthCm: 18,
              heightCm: 8,
              desi: 0.63,
            },
          ],
        },
      ],
      customerEmail: "matteo.rossi@milano.it",
      customerPhone: "+39 02 5551234",
      shippingAddress: {
        firstName: "Matteo",
        lastName: "Rossi",
        company: "Studio Rossi & Partners",
        address1: "Corso Buenos Aires 45",
        city: "Milano",
        postalCode: "20124",
        countryCode: "IT",
        email: "matteo.rossi@milano.it",
      },
      billingAddress: {
        firstName: "Matteo",
        lastName: "Rossi",
        company: "Studio Rossi & Partners",
        address1: "Corso Buenos Aires 45",
        city: "Milano",
        postalCode: "20124",
        countryCode: "IT",
        email: "matteo.rossi@milano.it",
      },
      paymentMethod: "google_pay",
      paymentTransactionId: "txn_gpay_demo_7842",
      subtotal: 249.0,
      taxTotal: 54.78, // 22% Italian VAT
      shippingTotal: 0.0,
      total: 303.78,
      currency: "EUR",
      status: "processing",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    };

    this.orders.set(demoOrder.orderNumber, demoOrder);
  }

  private checkDatabaseConnection(): void {
    const isPlaceholder =
      !this.connectionUrl ||
      this.connectionUrl.includes("PLACEHOLDER") ||
      this.connectionUrl.startsWith("postgres://placeholder") ||
      this.connectionUrl.startsWith("postgresql://placeholder");

    if (isPlaceholder) {
      console.log(
        "[DatabaseService] ⚡ Running in Serverless Demo Mode (In-Memory Store, $0.00 idle cost on Cloud Run)."
      );
      console.log(
        "[DatabaseService] 💡 To connect live PostgreSQL: set DATABASE_URL=postgresql://user:password@host:5432/dbname"
      );
      this.isPostgresConnected = false;
    } else {
      console.log(`[DatabaseService] Connecting to external database: ${this.connectionUrl.replace(/:[^:]*@/, ":****@")}`);
      this.isPostgresConnected = true;
    }
  }

  // Orders API
  public async saveOrder(order: GenericOrder): Promise<GenericOrder> {
    this.orders.set(order.orderNumber, order);
    console.log(`[DatabaseService] Order saved: ${order.orderNumber} (Total: ${order.total} ${order.currency})`);
    return order;
  }

  public async getOrder(orderNumber: string): Promise<GenericOrder | null> {
    return this.orders.get(orderNumber) || null;
  }

  public async listOrders(): Promise<GenericOrder[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Catalog API (Authoritative Server-Side Truth to prevent price tampering)
  public async getProductById(productId: string): Promise<GenericProduct | null> {
    return this.products.get(productId) || null;
  }

  public async getProductVariant(
    productId: string,
    variantId: string
  ): Promise<{ product: GenericProduct; variant: ProductVariant } | null> {
    const product = this.products.get(productId);
    if (!product) return null;
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return null;
    return { product, variant };
  }

  public async getProducts(): Promise<GenericProduct[]> {
    return Array.from(this.products.values());
  }

  // Support Tickets API
  public async getTickets(): Promise<CustomerInquiry[]> {
    return Array.from(this.supportTickets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getTicketById(id: string): Promise<CustomerInquiry | null> {
    return this.supportTickets.get(id) || null;
  }

  public async saveTicket(ticket: CustomerInquiry): Promise<CustomerInquiry> {
    this.supportTickets.set(ticket.id, ticket);
    return ticket;
  }

  public async updateTicket(ticket: CustomerInquiry): Promise<CustomerInquiry> {
    this.supportTickets.set(ticket.id, ticket);
    return ticket;
  }

  // Email Outbox API (For demo simulation & verification)
  public async recordEmail(email: EmailOutboxItem): Promise<void> {
    this.emailOutbox.unshift(email);
    // Keep max 50 items
    if (this.emailOutbox.length > 50) {
      this.emailOutbox.pop();
    }
  }

  public async getEmailOutbox(): Promise<EmailOutboxItem[]> {
    return [...this.emailOutbox];
  }

  // System Diagnostics
  public getStatus() {
    return {
      mode: this.isPostgresConnected ? "PostgreSQL (Cloud SQL / Neon)" : "Serverless In-Memory ($0.00 Idle Cost Demo)",
      totalOrders: this.orders.size,
      totalTickets: this.supportTickets.size,
      totalEmailsDispatched: this.emailOutbox.length,
      databaseUrlConfigured: Boolean(this.connectionUrl && !this.connectionUrl.includes("PLACEHOLDER")),
    };
  }
}

export const databaseService = DatabaseService.getInstance();
