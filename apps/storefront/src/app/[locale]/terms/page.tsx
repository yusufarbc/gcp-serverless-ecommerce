import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TermsPage({
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
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.termsOfService}</span>
      </nav>

      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
        {dict.termsOfService} (EU Cross-Border Sales)
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          1. Scope of Application
        </h2>
        <p>
          These General Terms and Conditions govern all purchase agreements concluded between consumers residing within the European Union (Germany, France, Italy, Spain, Netherlands, Austria, Belgium, and all EU member states) and Apex Direct Europe GmbH through our online store.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          2. Pricing and VAT Compliance (Union OSS)
        </h2>
        <p>
          All prices displayed are denominated in Euros (€) and include the statutory value-added tax applicable in the buyer&apos;s EU Member State under the European Union One-Stop Shop (OSS) VAT scheme. In accordance with the EU Omnibus Directive (Directive (EU) 2019/2161), any promotional price reduction explicitly indicates the lowest price applied during the 30-day period preceding the reduction.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          3. Delivery and Customs
        </h2>
        <p>
          Products are dispatched via tracked express courier services (DHL Express / UPS). Standard consumer parcels qualify for free delivery for orders above €100.00. All import clearance formalities under the EU-Turkey Customs Union (A.TR movement certificates) are handled direct-to-door with zero unexpected customs fees for the consumer.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          4. Consumer Guarantees and Dispute Resolution
        </h2>
        <p>
          Consumers benefit from the mandatory statutory two-year legal warranty of conformity under Directive (EU) 2019/771. The European Commission provides an online platform for alternative dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>https://ec.europa.eu/consumers/odr</a>.
        </p>
      </section>
    </div>
  );
}
