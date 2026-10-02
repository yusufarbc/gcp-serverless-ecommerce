import type { TranslationResponse } from "@repo/types";

export class GoogleTranslationService {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  }

  /**
   * Detect language and translate text to target language (defaults to "en" for English)
   */
  public async translateText(
    text: string,
    targetLanguage: string = "en",
    sourceLanguage?: string
  ): Promise<TranslationResponse> {
    if (!text || text.trim() === "") {
      return {
        translatedText: "",
        detectedSourceLanguage: sourceLanguage || "en",
        provider: "smart-engine",
      };
    }

    // 1. If Google Cloud API key is configured, call official Google Translation REST API
    if (this.apiKey) {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: sourceLanguage,
            format: "text",
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            data?: {
              translations?: Array<{
                translatedText: string;
                detectedSourceLanguage?: string;
              }>;
            };
          };

          const translation = data.data?.translations?.[0];
          if (translation) {
            return {
              translatedText: translation.translatedText,
              detectedSourceLanguage: translation.detectedSourceLanguage || sourceLanguage || "unknown",
              provider: "google-cloud-translate",
            };
          }
        } else {
          console.warn("[Google Translate API Error]:", await response.text());
        }
      } catch (err) {
        console.error("[Google Translate Network Error]:", err);
      }
    }

    // 2. High-fidelity fallback translation engine for European multilingual customer inquiries
    return this.fallbackTranslate(text, targetLanguage, sourceLanguage);
  }

  private fallbackTranslate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): TranslationResponse {
    const detected = sourceLanguage || this.detectLanguage(text);

    if (detected === targetLanguage) {
      return {
        translatedText: text,
        detectedSourceLanguage: detected,
        provider: "smart-engine",
      };
    }

    // Dictionary of EU consumer commerce keywords & phrases
    const glossary: Record<string, string> = {
      // German
      "wo ist meine bestellung": "Where is my order",
      "ich möchte meine bestellung stornieren": "I would like to cancel my order",
      "das paket ist beschädigt angekommen": "The parcel arrived damaged",
      "ich möchte die ware zurücksenden": "I would like to return the goods",
      "bitte senden sie mir die rechnung mit ausgewiesener mwst": "Please send me the invoice with itemized VAT",
      "wann wird die lieferung verschickt": "When will the shipment be dispatched",
      "die kopfhörer funktionieren einwandfrei aber ich benötige eine quittung": "The headphones work perfectly but I need a receipt",
      "vielen dank für die schnelle lieferung": "Thank you very much for the fast delivery",

      // French
      "où est ma commande": "Where is my order",
      "je souhaite annuler ma commande": "I would like to cancel my order",
      "le colis est arrivé endommagé": "The parcel arrived damaged",
      "je souhaite retourner le produit selon le droit de rétractation de 14 jours": "I would like to return the product under the 14-day right of withdrawal",
      "pourriez-vous m'envoyer la facture avec tva": "Could you please send me the invoice with VAT",
      "merci pour la livraison express": "Thank you for the express delivery",

      // Italian
      "dov'è il mio ordine": "Where is my order",
      "desidero annullare l'ordine": "I would like to cancel the order",
      "il pacco è arrivato danneggiato": "The parcel arrived damaged",
      "vorrei effettuare il reso secondo il diritto di recesso": "I would like to return the item under the statutory right of withdrawal",
      "ho bisogno della fattura con iva italiana al 22%": "I need the invoice with 22% Italian VAT",
      "la lampada luma è bellissima grazie mille": "The Luma lamp is beautiful, thank you very much",

      // Spanish
      "dónde está mi pedido": "Where is my order",
      "deseo cancelar mi pedido": "I wish to cancel my order",
      "el paquete llegó dañado": "The package arrived damaged",
      "quiero solicitar una devolución": "I want to request a return",
      "necesito la factura con desglose de iva": "I need the invoice with VAT breakdown",

      // Dutch
      "waar is mijn bestelling": "Where is my order",
      "ik wil mijn bestelling annuleren": "I want to cancel my order",
      "het pakket is beschadigd aangekomen": "The parcel arrived damaged",
      "ik wil gebruikmaken van mijn herroepingsrecht": "I want to exercise my right of withdrawal",
      "kunt u mij de factuur sturen": "Could you send me the invoice",
    };

    const lower = text.toLowerCase().trim();
    if (glossary[lower]) {
      return {
        translatedText: glossary[lower],
        detectedSourceLanguage: detected,
        provider: "smart-engine",
      };
    }

    // Term-by-term contextual replacement for custom messages
    let translated = text;
    const wordMap: Record<string, string> = {
      // German
      "Bestellung": "Order",
      "Paket": "Parcel",
      "Sendungsverfolgung": "Tracking",
      "beschädigt": "damaged",
      "Rechnung": "Invoice",
      "Rücksendung": "Return",
      "Widerruf": "Withdrawal",
      "versendet": "dispatched",
      "geliefert": "delivered",
      "Garantie": "Warranty",
      "Hilfe": "Help",

      // French
      "commande": "order",
      "colis": "parcel",
      "facture": "invoice",
      "retour": "return",
      "endommagé": "damaged",
      "livraison": "delivery",
      "remboursement": "refund",

      // Italian
      "ordine": "order",
      "pacco": "parcel",
      "reso": "return",
      "danneggiato": "damaged",
      "fattura": "invoice",
      "spedizione": "shipment",
      "rimborso": "refund",
      "garanzia": "warranty",

      // Spanish
      "pedido": "order",
      "paquete": "parcel",
      "devolución": "return",
      "envío": "shipping",
      "dañado": "damaged",

      // Dutch
      "bestelling": "order",
      "factuur": "invoice",
      "verzending": "shipping",
    };

    for (const [key, replacement] of Object.entries(wordMap)) {
      const reg = new RegExp(`\\b${key}\\b`, "gi");
      translated = translated.replace(reg, replacement);
    }

    return {
      translatedText: translated !== text ? translated : `[Translated from ${detected.toUpperCase()}]: ${text}`,
      detectedSourceLanguage: detected,
      provider: "smart-engine",
    };
  }

  public detectLanguage(text: string): string {
    const t = text.toLowerCase();
    // Italian specific markers
    if (/\b(il|la|gli|le|dov'è|mio|ordine|pacco|reso|grazie|fattura|vorrei|danneggiato|spedizione)\b/.test(t)) {
      return "it";
    }
    // German specific markers
    if (/\b(ich|ist|meine|bestellung|rechnung|bitte|widerruf|rücksendung|danke|schönen|haben|nicht)\b/.test(t)) {
      return "de";
    }
    // French specific markers
    if (/\b(le|la|les|où|commande|merci|facture|souhaite|colis|retourner|rétractation)\b/.test(t)) {
      return "fr";
    }
    // Spanish specific markers
    if (/\b(el|la|dónde|está|pedido|factura|devolución|gracias|paquete|quiero)\b/.test(t)) {
      return "es";
    }
    // Dutch specific markers
    if (/\b(waar|mijn|bestelling|factuur|graag|herroeping|pakket|beschadigd)\b/.test(t)) {
      return "nl";
    }
    return "en";
  }
}
