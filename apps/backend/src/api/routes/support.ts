import { Router, Request, Response } from "express";
import { GoogleTranslationService } from "../../services/translation";
import { databaseService } from "../../db/database-service";
import { emailService } from "../../services/email";
import type { CustomerInquiry } from "@repo/types";

export const supportRouter = Router();
const translationService = new GoogleTranslationService();

/**
 * GET /api/support/tickets
 * Lists all tickets with automatic translation into English
 */
supportRouter.get("/tickets", async (_req: Request, res: Response) => {
  try {
    const rawTickets = await databaseService.getTickets();
    const translatedTickets = await Promise.all(
      rawTickets.map(async (ticket) => {
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

    await databaseService.saveTicket(newTicket);

    // Send confirmation to customer via email service
    await emailService.sendEmail({
      to: customerEmail,
      subject: `Support Ticket Created: ${newTicket.ticketNumber}`,
      template: "support_reply",
      data: {
        ticketNumber: newTicket.ticketNumber,
        message: `Thank you for contacting us. Your inquiry has been received and translated for our support desk. We will get back to you shortly.`,
      },
    });

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

    const ticket = await databaseService.getTicketById(id);
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

    await databaseService.updateTicket(ticket);

    // Send translated response to customer email
    await emailService.sendEmail({
      to: ticket.customerEmail,
      subject: `Reply to Ticket ${ticket.ticketNumber}`,
      template: "support_reply",
      data: {
        ticketNumber: ticket.ticketNumber,
        replyText: translatedReply.translatedText,
      },
    });

    return res.status(200).json({
      success: true,
      ticket,
      reply: replyEntry,
    });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});
