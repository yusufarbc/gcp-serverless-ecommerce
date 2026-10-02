"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SupportedLocale, CustomerInquiry } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../../lib/i18n";

export default function SupportAdminPage() {
  const params = useParams();
  const resolvedLocale = (params?.locale as string) || "en";
  const locale = (LOCALES.includes(resolvedLocale as SupportedLocale) ? resolvedLocale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  const [tickets, setTickets] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyLoadingMap, setReplyLoadingMap] = useState<Record<string, boolean>>({});

  // Real-time Translate Sandbox state
  const [sandboxInput, setSandboxInput] = useState("Il pacco è arrivato danneggiato, vorrei richiedere il rimborso o una nuova spedizione.");
  const [sandboxTargetLang, setSandboxTargetLang] = useState("en");
  const [sandboxOutput, setSandboxOutput] = useState("");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxProvider, setSandboxProvider] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const toggleOriginal = (ticketId: string) => {
    setShowOriginalMap((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const handleReplySubmit = async (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || text.trim() === "") return;

    setReplyLoadingMap((prev) => ({ ...prev, [ticketId]: true }));
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyTextEn: text }),
      });

      if (res.ok) {
        setReplyTextMap((prev) => ({ ...prev, [ticketId]: "" }));
        await fetchTickets();
      }
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setReplyLoadingMap((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleTestTranslate = async () => {
    if (!sandboxInput.trim()) return;
    setSandboxLoading(true);
    try {
      const res = await fetch("/api/support/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sandboxInput,
          targetLanguage: sandboxTargetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxOutput(data.translatedText);
        setSandboxProvider(data.provider);
      }
    } catch (err) {
      console.error("Translate error:", err);
    } finally {
      setSandboxLoading(false);
    }
  };

  const getLanguageFlag = (lang?: string) => {
    switch (lang?.toLowerCase()) {
      case "it": return "🇮🇹 Italian";
      case "de": return "🇩🇪 German";
      case "fr": return "🇫🇷 French";
      case "es": return "🇪🇸 Spanish";
      case "nl": return "🇳🇱 Dutch";
      case "en": return "🇬🇧 English";
      default: return `🌐 ${lang || "Unknown"}`;
    }
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#6b7280" }}>Apex Direct</Link>
        {" / "}
        <Link href={`/${locale}/support`} style={{ textDecoration: "none", color: "#6b7280" }}>{dict.support}</Link>
        {" / "}
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.customerDesk}</span>
      </nav>

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          padding: "2rem 2.5rem",
          borderRadius: "0.75rem",
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#334155", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, color: "#38bdf8", marginBottom: "0.75rem" }}>
            <span>⚡ Powered by Google Cloud Translation API</span>
          </div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", fontWeight: 800 }}>
            {dict.customerDesk}
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "1rem", maxWidth: "700px" }}>
            All incoming inquiries from across Europe (German, French, Italian, Spanish, Dutch) are automatically translated into English in real-time.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "0.65rem 1.25rem",
            borderRadius: "0.375rem",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          🔄 Refresh Inquiries
        </button>
      </div>

      {/* Google Translate Sandbox Tool */}
      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "1.75rem", marginBottom: "2.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🧪</span> Live Google Translate Playground
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "#64748b", fontSize: "0.875rem" }}>
          Test real-time language detection and English translation for any consumer message:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <textarea
              rows={3}
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              placeholder="Paste customer text in Italian, German, French, Spanish, Dutch..."
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <div
              style={{
                width: "100%",
                minHeight: "84px",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #cbd5e1",
                backgroundColor: "white",
                fontSize: "0.9rem",
                color: sandboxOutput ? "#0f172a" : "#94a3b8",
              }}
            >
              {sandboxOutput || "Translated English text will appear here..."}
            </div>
            {sandboxProvider && (
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, display: "block", marginTop: "0.25rem" }}>
                ✓ Translated via {sandboxProvider}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={handleTestTranslate}
            disabled={sandboxLoading}
            style={{
              backgroundColor: "#0f172a",
              color: "white",
              border: "none",
              padding: "0.6rem 1.25rem",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: sandboxLoading ? "not-allowed" : "pointer",
            }}
          >
            {sandboxLoading ? "Translating..." : "Translate to English →"}
          </button>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Target: English (en)</span>
        </div>
      </div>

      {/* Tickets List */}
      <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "1.25rem" }}>
        Customer Inquiries ({tickets.length})
      </h2>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
          Translating and loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          No support inquiries found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {tickets.map((ticket) => {
            const isOriginal = showOriginalMap[ticket.id];
            const currentReply = replyTextMap[ticket.id] || "";
            const isReplying = replyLoadingMap[ticket.id];

            return (
              <div
                key={ticket.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  padding: "1.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Ticket Meta */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                      {ticket.ticketNumber}
                    </span>
                    <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "0.25rem" }}>
                      {getLanguageFlag(ticket.sourceLanguage)}
                    </span>
                    <span style={{ backgroundColor: ticket.status === "resolved" ? "#ecfdf5" : "#fef3c7", color: ticket.status === "resolved" ? "#065f46" : "#92400e", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "0.25rem", textTransform: "capitalize" }}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {ticket.customerName} ({ticket.customerEmail}) {ticket.orderNumber && `• Order: ${ticket.orderNumber}`}
                  </div>
                </div>

                {/* Translation Toggle & Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span>🌐</span>
                    <span>{dict.translatedByGoogle}</span>
                  </div>

                  <button
                    onClick={() => toggleOriginal(ticket.id)}
                    style={{
                      background: "none",
                      border: "1px solid #cbd5e1",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {isOriginal ? "Show English Translation" : "Show Original Text"}
                  </button>
                </div>

                {/* Message Content */}
                <div style={{ backgroundColor: isOriginal ? "#fffbeb" : "#f8fafc", border: `1px solid ${isOriginal ? "#fef3c7" : "#e2e8f0"}`, borderRadius: "0.5rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", color: "#0f172a", fontWeight: 700 }}>
                    {isOriginal ? ticket.subject : ticket.translatedSubjectEn || ticket.subject}
                  </h4>
                  <p style={{ margin: 0, color: "#334155", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {isOriginal ? ticket.originalMessage : ticket.translatedMessageEn || ticket.originalMessage}
                  </p>
                </div>

                {/* Responses Thread */}
                {ticket.responses && ticket.responses.length > 0 && (
                  <div style={{ marginBottom: "1.25rem", paddingLeft: "1rem", borderLeft: "3px solid #2563eb" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.5rem" }}>
                      Support Responses Sent:
                    </div>
                    {ticket.responses.map((rep) => (
                      <div key={rep.id} style={{ backgroundColor: "#eff6ff", padding: "0.75rem 1rem", borderRadius: "0.375rem", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                        <div style={{ color: "#1e40af", marginBottom: "0.25rem" }}>
                          <strong>English Original:</strong> {rep.originalText}
                        </div>
                        {rep.translatedText && (
                          <div style={{ color: "#0369a1", fontSize: "0.825rem", fontStyle: "italic" }}>
                            <strong>Sent to customer ({rep.targetLanguage?.toUpperCase()}):</strong> {rep.translatedText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginTop: "1rem" }}>
                  <textarea
                    rows={2}
                    value={currentReply}
                    onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                    placeholder={`Write reply in English (will be auto-translated to ${getLanguageFlag(ticket.sourceLanguage)})...`}
                    style={{ flexGrow: 1, padding: "0.6rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
                  />
                  <button
                    onClick={() => handleReplySubmit(ticket.id)}
                    disabled={isReplying || !currentReply.trim()}
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "0.6rem 1.1rem",
                      borderRadius: "0.375rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: isReplying || !currentReply.trim() ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isReplying ? "Translating..." : "Translate & Send"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
