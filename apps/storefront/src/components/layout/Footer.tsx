"use client";
import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../lib/i18n";

export const Footer: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  const reopenCookieBanner = () => {
    localStorage.removeItem("gcp_consent_status");
    window.location.reload();
  };

  return (
    <footer style={{ backgroundColor: "#111827", color: "#9ca3af", padding: "3.5rem 1.5rem 2rem 1.5rem", marginTop: "4rem", borderTop: "1px solid #1f2937" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2.5rem" }}>
        {/* Brand Col */}
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>{dict.brand}</h4>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#9ca3af" }}>{dict.tagline}</p>
          <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#6b7280" }}>
            📍 Frankfurt am Main (europe-west3) • EU Data Sovereignty
          </div>
        </div>

        {/* GPSR Col */}
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>{dict.gpsrTitle}</h4>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            {dict.gpsrAddress}
            <br />
            Email: <a href="mailto:compliance@directcommerce.eu" style={{ color: "#38bdf8", textDecoration: "none" }}>compliance@directcommerce.eu</a>
          </p>
        </div>

        {/* EU Legal Documents */}
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>Legal & Compliance</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>
              <Link href={`/${locale}/privacy`} style={{ color: "#d1d5db", textDecoration: "none" }}>
                🔒 {dict.privacyPolicy} (GDPR)
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/terms`} style={{ color: "#d1d5db", textDecoration: "none" }}>
                📋 {dict.termsOfService}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/withdrawal`} style={{ color: "#d1d5db", textDecoration: "none" }}>
                ↩️ {dict.withdrawalNotice} (14 Days)
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/imprint`} style={{ color: "#d1d5db", textDecoration: "none" }}>
                🏛️ {dict.legalNotice}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/support`} style={{ color: "#d1d5db", textDecoration: "none" }}>
                💬 {dict.support}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/support/admin`} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
                🌐 {dict.customerDesk} (Translate)
              </Link>
            </li>
            <li>
              <button
                onClick={reopenCookieBanner}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "0.8rem",
                  marginTop: "0.25rem",
                }}
              >
                ⚙️ {dict.cookieSettings}
              </button>
            </li>
          </ul>
        </div>

        {/* Payments & Guarantees */}
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>Pan-EU Standards</h4>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
            • Union OSS Dynamic VAT Calculation<br />
            • Google Pay & PayPal Express Buyer Protection<br />
            • DHL Express / UPS End-to-End Tracking<br />
            • Google Consent Mode v2 First-Party Telemetry
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "2.5rem auto 0 auto", paddingTop: "1.5rem", borderTop: "1px solid #1f2937", textAlign: "center", fontSize: "0.8rem", color: "#6b7280" }}>
        © {new Date().getFullYear()} {dict.brand} Europe. All rights reserved. Serverless platform powered by Google Cloud Platform (europe-west3).
      </div>
    </footer>
  );
};
