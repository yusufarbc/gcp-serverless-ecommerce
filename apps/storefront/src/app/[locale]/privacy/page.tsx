import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function PrivacyPage({
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
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.privacyPolicy}</span>
      </nav>

      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
        {dict.privacyPolicy} (GDPR / DSGVO / RGPD)
      </h1>

      <p style={{ fontSize: "1rem", color: "#4b5563", marginBottom: "2rem" }}>
        This privacy notice informs you how Apex Direct collects, processes, and protects your personal data in strict compliance with the General Data Protection Regulation (Regulation (EU) 2016/679 - GDPR) across the European Union.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          1. Data Controller (Art. 4(7) GDPR)
        </h2>
        <p>
          The responsible data controller for all data processing activities on this platform is:
        </p>
        <div style={{ backgroundColor: "#f9fafb", padding: "1rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", margin: "0.75rem 0" }}>
          <strong>Apex Direct Europe GmbH</strong><br />
          Westhafen Tower, Speicherstraße 55, 60327 Frankfurt am Main, Germany<br />
          Data Protection Officer: <a href="mailto:dpo@directcommerce.eu" style={{ color: "#2563eb" }}>dpo@directcommerce.eu</a><br />
          EU Responsible Person (GPSR): Dr. Klaus Schneider
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          2. Data Residency and Cloud Infrastructure
        </h2>
        <p>
          All servers, databases, and microservices are hosted in the <strong>Google Cloud Platform (GCP) Europe-West3 region (Frankfurt am Main, Germany)</strong>. Your data remains strictly within the European Union territory and is processed pursuant to Standard Contractual Clauses (SCC) and GDPR Art. 28 Data Processing Agreements (DPA).
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          3. Purposes and Legal Bases of Processing (Art. 6 GDPR)
        </h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li><strong>Contract Performance (Art. 6(1)(b) GDPR):</strong> Processing orders, logistics routing (DHL Express / UPS), payment tokenization (Google Pay / PayPal), and customs declaration (A.TR / HS Codes).</li>
          <li><strong>Legal Obligations (Art. 6(1)(c) GDPR):</strong> Tax compliance under the EU Union One-Stop-Shop (OSS) VAT directive and statutory bookkeeping records (stored securely for the statutory 10-year period).</li>
          <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> First-party analytical telemetry and Google Consent Mode v2. All non-essential tags remain strictly blocked (status <em>&quot;denied&quot;</em>) until explicit user consent is granted.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          4. Your Rights under the GDPR (Art. 15–22 GDPR)
        </h2>
        <p>As a European data subject, you hold the following statutory rights:</p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li><strong>Right of Access (Art. 15):</strong> Request a copy of all personal data held about you.</li>
          <li><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate information.</li>
          <li><strong>Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17):</strong> Request deletion of your data when no statutory retention period applies.</li>
          <li><strong>Right to Restriction of Processing (Art. 18) & Data Portability (Art. 20):</strong> Receive your data in a structured, commonly used JSON/CSV format.</li>
          <li><strong>Right to Object (Art. 21) & Withdraw Consent (Art. 7(3)):</strong> You may revoke cookie or telemetry consent at any time via the Cookie Settings in our footer.</li>
        </ul>
        <p style={{ marginTop: "1rem" }}>
          To exercise your rights, please email us at <a href="mailto:privacy@directcommerce.eu" style={{ color: "#2563eb" }}>privacy@directcommerce.eu</a>. You also have the right to lodge a complaint with your local EU Data Protection Authority (e.g. BfDI in Germany, CNIL in France, Garante in Italy, AEPD in Spain, AP in the Netherlands).
        </p>
      </section>
    </div>
  );
}
