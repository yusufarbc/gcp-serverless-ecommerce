import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = (LOCALES.includes(resolved.locale as SupportedLocale) ? resolved.locale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  return (
    <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2.5rem", backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
      <h1 style={{ color: "#166534", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
        {dict.orderSuccessTitle}
      </h1>
      <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
        {dict.orderSuccessDesc}
      </p>
      <Link
        href={`/${locale}`}
        style={{
          display: "inline-block",
          backgroundColor: "#111827",
          color: "white",
          padding: "0.75rem 1.75rem",
          borderRadius: "0.375rem",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
        }}
      >
        {dict.backToShop}
      </Link>
    </div>
  );
}
