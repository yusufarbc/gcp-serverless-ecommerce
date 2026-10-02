"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export default function CustomerSupportPage() {
  const params = useParams();
  const resolvedLocale = (params?.locale as string) || "en";
  const locale = (LOCALES.includes(resolvedLocale as SupportedLocale) ? resolvedLocale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          orderNumber,
          subject,
          message,
          language: locale,
          countryCode: locale.toUpperCase(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit support request");
      }

      const data = await res.json();
      setTicketNumber(data.ticket?.ticketNumber || "SUP-EU-2026-OK");
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <nav style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#6b7280" }}>Apex Direct</Link>
        {" / "}
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.support}</span>
      </nav>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem 0" }}>
            {dict.support}
          </h1>
          <p style={{ color: "#4b5563", fontSize: "1.05rem", margin: 0 }}>
            {dict.supportDesc}
          </p>
        </div>

        <Link
          href={`/${locale}/support/admin`}
          style={{
            backgroundColor: "#1e293b",
            color: "white",
            padding: "0.6rem 1.1rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <span>🌐</span>
          <span>{dict.customerDesk} (Google Translate)</span>
        </Link>
      </div>

      {submitted ? (
        <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2.5rem", borderRadius: "0.75rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
          <h2 style={{ color: "#065f46", fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>
            Inquiry Submitted Successfully
          </h2>
          <p style={{ color: "#047857", marginBottom: "1.5rem" }}>
            Your ticket reference: <strong>{ticketNumber}</strong>. Our European support desk will reply promptly.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link
              href={`/${locale}/support/admin`}
              style={{
                backgroundColor: "#065f46",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              View in Operations Desk →
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage("");
                setSubject("");
              }}
              style={{
                background: "none",
                border: "1px solid #065f46",
                color: "#065f46",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {error && (
            <div style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "0.375rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Matteo Rossi"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.eu"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
              Order Number (Optional)
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-EU-2026-7842"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
              {dict.ticketSubject}
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Return request under 14-day statutory right"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.95rem" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
              {dict.ticketMessage}
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your request in your preferred language (German, French, Italian, Spanish, Dutch, English)..."
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.95rem", lineHeight: 1.5 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "0.85rem 1.75rem",
              borderRadius: "0.375rem",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            }}
          >
            {loading ? "Submitting..." : dict.sendInquiry}
          </button>
        </form>
      )}
    </div>
  );
}
