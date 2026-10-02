"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SupportedLocale } from "@repo/types";

interface Props {
  locale: SupportedLocale;
  dict: any;
}

export const OrderSuccessClient: React.FC<Props> = ({ locale, dict }) => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("orderNumber") || "ORD-EU-2026-7842";
  const country = searchParams?.get("country") || (locale === "it" ? "IT" : locale === "fr" ? "FR" : "DE");
  const token = searchParams?.get("token") || (orderNumber === "ORD-EU-2026-7842" ? "demo-sec-token-7842-eu" : "");

  const apiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "";
  const invoiceUrl = token
    ? `${apiUrl}/api/checkout/orders/${encodeURIComponent(orderNumber)}/invoice?token=${encodeURIComponent(token)}`
    : `${apiUrl}/api/checkout/orders/${encodeURIComponent(orderNumber)}/invoice`;

  return (
    <div style={{ maxWidth: "680px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>

        <h1 style={{ color: "#166534", fontSize: "1.85rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          {dict.orderSuccessTitle}
        </h1>

        <div
          style={{
            display: "inline-block",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "0.4rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#166534",
            marginBottom: "1.5rem",
          }}
        >
          Reference: {orderNumber}
        </div>

        <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          {dict.orderSuccessDesc}
        </p>

        {/* Demo Logistics Status Card */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            padding: "1.25rem",
            textAlign: "left",
            marginBottom: "1.75rem",
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📦 Logistics & European Fulfillment</span>
            <span style={{ fontSize: "0.75rem", backgroundColor: "#dbeafe", color: "#1e40af", padding: "0.15rem 0.5rem", borderRadius: "4px", marginLeft: "auto" }}>
              Automated Dispatch
            </span>
          </div>
          <div style={{ color: "#4b5563" }}>
            <strong>Carrier:</strong> DHL Express Europe (Cross-border Parcel)<br />
            <strong>Tracking No:</strong> <span style={{ fontFamily: "monospace", color: "#2563eb" }}>JJD014987239012</span><br />
            <strong>Destination:</strong> European Union ({country})<br />
            <strong>Estimated Delivery:</strong> 2 - 3 business days
          </div>
        </div>

        {/* Action Buttons: Invoice & Support */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <span>📄</span>
            <span>View / Print EU VAT Invoice</span>
          </a>

          <Link
            href={`/${locale}/support`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            <span>💬</span>
            <span>Need Help? Customer Support</span>
          </Link>
        </div>

        {/* Demo Mode Notice */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "0.5rem",
            padding: "0.9rem",
            fontSize: "0.8rem",
            color: "#92400e",
            textAlign: "left",
            lineHeight: 1.5,
          }}
        >
          <strong>⚡ Serverless Demo Architecture:</strong> Payment was authorized in zero-cost Sandbox Mode. Cloud Tasks asynchronously enqueued the EU VAT invoice generation and simulated confirmation email dispatch.
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link
            href={`/${locale}`}
            style={{
              color: "#6b7280",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            ← {dict.backToShop}
          </Link>
        </div>
      </div>
    </div>
  );
};
