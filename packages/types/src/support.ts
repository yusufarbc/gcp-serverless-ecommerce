export interface CustomerInquiry {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string;
  countryCode: string; // e.g. "DE", "FR", "IT", "ES", "NL"
  subject: string;
  originalMessage: string;
  sourceLanguage: string; // "de", "fr", "it", "es", "nl", "en"
  translatedSubjectEn?: string;
  translatedMessageEn?: string;
  status: "open" | "in_progress" | "resolved";
  category: "order_status" | "return_request" | "product_inquiry" | "vat_invoice" | "customs" | "general";
  createdAt: string;
  responses?: Array<{
    id: string;
    sender: "customer" | "support";
    originalText: string;
    originalLanguage: string;
    translatedText?: string;
    targetLanguage?: string;
    createdAt: string;
  }>;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string; // defaults to "en"
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage: string;
  provider: "google-cloud-translate" | "smart-engine";
}
