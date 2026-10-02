import { Router, Request, Response } from "express";
import { GoogleTranslationService } from "../../services/translation";
import type { CustomerInquiry } from "@repo/types";

export const supportRouter = Router();
const translationService = new GoogleTranslationService();

// In-memory support inquiry store (initialized with realistic pan-EU customer tickets)
const MOCK_TICKETS: CustomerInquiry[] = [
  {
    id: "tkt_it_001",
    ticketNumber: "SUP-IT-2026-8941",
    customerName: "Matteo Rossi",
    customerEmail: "matteo.rossi@milano.it",
    orderNumber: "ORD-EU-2026-7842",
    countryCode: "IT",
    subject: "Richiesta fattura con codice destinatario SDI e IVA 22%",
    originalMessage: "Buongiorno, ho ricevuto le cuffie Aura Pro. Vorrei ricevere la fattura elettronica con il riepilogo dell'IVA italiana al 22% per la mia azienda a Milano. Grazie mille.",
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
    originalMessage: "Hallo Support-Team, wo ist meine bestellung? Die Sendungsverfolgung zeigt seit gestern den Status in Frankfurt. Wann wird die Lieferung zugestellt?",
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
    subject: "Droit de rétractation de 14 jours - Demande de retour",
    originalMessage: "Bonjour, je souhaite retourner le produit selon le droit de rétractation de 14 jours de l'Union Européenne. Pourriez-vous m'envoyer l'étiquette de retour pour le dépôt en Allemagne ?",
    sourceLanguage: "fr",
    status: "open",
    category: "return_request",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    responses: [],
  },
  {
    id: "tkt_es_004",
    ticketNumber: "SUP-ES-2026-5519",
    customerName: "Carlos Fernandez",
    customerEmail: "carlos.f@madrid.es",
    orderNumber: "ORD-EU-2026-9218",
    countryCode: "ES",
    subject: "Pregunta sobre la garantía del reloj Horizon",
    originalMessage: "Hola, acabo de comprar el reloj Horizon Automático. ¿La garantía legal de 2 años de la UE cubre la resistencia al agua en piscina? Gracias.",
    sourceLanguage: "es",
    status: "open",
    category: "product_inquiry",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    responses: [],
  },
];

/**
 * GET /api/support/tickets
 * Lists all tickets with automatic translation into English
 */
supportRouter.get("/tickets", async (_req: Request, res: Response) => {
  try {
    const translatedTickets = await Promise.all(
      MOCK_TICKETS.map(async (ticket) => {
        // If not already translated, translate subject and message to English
        if (!ticket.translatedMessageEn) {
          const transSubject = await translationService.translateText(ticket.subject, "en", ticket.sourceLanguage);
          const transMsg = await translationService.translateText(ticket.originalMessage, "en", ticket.sourceLanguage);

          ticket.translatedSubjectEn = transSubject.translatedText;
          ticket.translatedMessageEn = transMsg.translatedText;
          ticket.sourceLanguage = transMsg.detectedSourceLanguage || ticket.sourceLanguage;
        }
        return ticket;
      })
    );

    return res.status(200).json({
      success: true,
      total: translatedTickets.length,
      tickets: translatedTickets,
    });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/support/tickets
 * Submit a customer inquiry from storefront
 */
supportRouter.post("/tickets", async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, orderNumber, countryCode, subject, message, language } = req.body;

    if (!customerName || !customerEmail || !message) {
      return res.status(400).json({ error: "customerName, customerEmail, and message are required" });
    }

    const detectedLang = language || translationService.detectLanguage(message);
    const transSubject = await translationService.translateText(subject || "Support Inquiry", "en", detectedLang);
    const transMsg = await translationService.translateText(message, "en", detectedLang);

    const newTicket: CustomerInquiry = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `SUP-${(countryCode || "EU").toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerEmail,
      orderNumber,
      countryCode: countryCode || "EU",
      subject: subject || "Customer Inquiry",
      originalMessage: message,
      sourceLanguage: detectedLang,
      translatedSubjectEn: transSubject.translatedText,
      translatedMessageEn: transMsg.translatedText,
      status: "open",
      category: "general",
      createdAt: new Date().toISOString(),
      responses: [],
    };

    MOCK_TICKETS.unshift(newTicket);

    return res.status(201).json({
      success: true,
      ticket: newTicket,
    });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/support/translate
 * Direct Google Translate endpoint for real-time translation of any text to English or other languages
 */
supportRouter.post("/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage = "en", sourceLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const result = await translationService.translateText(text, targetLanguage, sourceLanguage);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * POST /api/support/tickets/:id/reply
 * Support agent writes a reply in English, and it is automatically translated back into the customer's language
 */
supportRouter.post("/tickets/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { replyTextEn } = req.body;

    if (!replyTextEn) {
      return res.status(400).json({ error: "replyTextEn is required" });
    }

    const ticket = MOCK_TICKETS.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Translate English response into the customer's native language (e.g. Italian, German, French)
    const translatedReply = await translationService.translateText(replyTextEn, ticket.sourceLanguage, "en");

    const replyEntry = {
      id: `rep_${Date.now()}`,
      sender: "support" as const,
      originalText: replyTextEn,
      originalLanguage: "en",
      translatedText: translatedReply.translatedText,
      targetLanguage: ticket.sourceLanguage,
      createdAt: new Date().toISOString(),
    };

    ticket.responses = ticket.responses || [];
    ticket.responses.push(replyEntry);
    ticket.status = "resolved";

    return res.status(200).json({
      success: true,
      ticket,
      reply: replyEntry,
    });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});
