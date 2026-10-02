"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../lib/i18n";
import { updateConsentMode } from "../../lib/gtm";

export const ConsentBanner: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const [visible, setVisible] = useState(false);
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  useEffect(() => {
    const consent = localStorage.getItem("gcp_consent_status");
    if (!consent) {
      // Default initial state: strictly denied under GDPR
      updateConsentMode({
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("gcp_consent_status", "all");
    updateConsentMode({
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    setVisible(false);
  };

  const rejectNonEssential = () => {
    localStorage.setItem("gcp_consent_status", "essential");
    updateConsentMode({
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie Consent"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        left: "1.5rem",
        maxWidth: "520px",
        margin: "0 auto",
        backgroundColor: "#111827",
        color: "#ffffff",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        zIndex: 9999,
        border: "1px solid #374151",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem" }}>🇪🇺</span>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
          {dict.cookieTitle}
        </h3>
      </div>
      <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", lineHeight: 1.5, color: "#d1d5db" }}>
        {dict.cookieDesc}{" "}
        <Link href={`/${locale}/privacy`} style={{ color: "#38bdf8", textDecoration: "underline" }}>
          {dict.privacyPolicy}
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button
          onClick={rejectNonEssential}
          style={{
            background: "none",
            color: "#e5e7eb",
            border: "1px solid #4b5563",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          {dict.rejectNonEssential}
        </button>
        <button
          onClick={acceptAll}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {dict.acceptAll}
        </button>
      </div>
    </aside>
  );
};
