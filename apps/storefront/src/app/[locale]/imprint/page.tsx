import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = (LOCALES.includes(resolved.locale as SupportedLocale) ? resolved.locale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  return (
    <div style={{ maxWidth: "860px", margin: "3rem auto", padding: "0 1.5rem", lineHeight: 1.7, color: "#374151" }}>
      <nav style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#6b7280" }}>Apex Direct</Link>
        {" / "}
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.legalNotice}</span>
      </nav>

      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
        {dict.legalNotice} (Impressum / Mentions Légales)
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Information pursuant to § 5 TMG / EU Digital Services Act
        </h2>
        <p>
          <strong>Apex Direct Europe GmbH</strong><br />
          Westhafen Tower, Speicherstraße 55<br />
          60327 Frankfurt am Main, Germany<br />
          Commercial Register: Amtsgericht Frankfurt am Main, HRB 123456<br />
          Managing Director: Dr. Klaus Schneider
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Contact Information
        </h2>
        <p>
          Email: <a href="mailto:support@directcommerce.eu" style={{ color: "#2563eb" }}>support@directcommerce.eu</a><br />
          Phone: +49 (0) 69 1234 5678<br />
          Website: <a href="https://apexstore.eu" style={{ color: "#2563eb" }}>https://apexstore.eu</a>
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          VAT & Tax Identification
        </h2>
        <p>
          VAT ID pursuant to § 27 a German VAT Act (UStG): <strong>DE 987654321</strong><br />
          EU One-Stop-Shop (OSS) Tax Identification: <strong>EU987654321</strong>
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          General Product Safety Regulation (GPSR) Responsible Person (EU 2023/988)
        </h2>
        <div style={{ backgroundColor: "#f9fafb", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <strong>EU Commerce Compliance Services GmbH</strong><br />
          Authorized Representative: Dr. Klaus Schneider<br />
          Address: Westhafen Tower, Speicherstraße 55, 60327 Frankfurt am Main, Germany<br />
          Electronic Contact: <a href="mailto:compliance@directcommerce.eu" style={{ color: "#2563eb" }}>compliance@directcommerce.eu</a>
        </div>
      </section>
    </div>
  );
}
