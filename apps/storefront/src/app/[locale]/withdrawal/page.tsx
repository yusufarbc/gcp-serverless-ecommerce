import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function WithdrawalPage({
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
        <span style={{ color: "#111827", fontWeight: 600 }}>{dict.withdrawalNotice}</span>
      </nav>

      <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
        {dict.withdrawalNotice} (EU Directive 2011/83/EU)
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Statutory 14-Day Right of Withdrawal
        </h2>
        <p>
          You have the right to withdraw from this contract within 14 calendar days without giving any reason. The withdrawal period will expire 14 days from the day on which you acquire, or a third party indicated by you acquires, physical possession of the goods.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Exercise of Withdrawal
        </h2>
        <p>
          To exercise your right of withdrawal, you must inform us (Apex Direct Europe GmbH, Westhafen Tower, Speicherstraße 55, 60327 Frankfurt am Main, Germany, Email: <a href="mailto:returns@directcommerce.eu" style={{ color: "#2563eb" }}>returns@directcommerce.eu</a>) of your decision to withdraw from this contract by an unequivocal statement (e.g. email or postal letter).
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>
          Reimbursement and Returns
        </h2>
        <p>
          If you withdraw from this contract, we will reimburse all payments received from you, including the costs of standard delivery, without undue delay and not later than 14 days from the day on which we are informed about your decision. You must send back the goods to our certified European consolidation depot in Germany no later than 14 days from communicating your withdrawal.
        </p>
      </section>

      <section style={{ backgroundColor: "#f9fafb", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
          Model Withdrawal Form
        </h3>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          (Complete and return this form only if you wish to withdraw from the contract):
        </p>
        <pre style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontSize: "0.85rem", overflowX: "auto" }}>
{`To: Apex Direct Europe GmbH, Westhafen Tower, 60327 Frankfurt am Main, Germany
Email: returns@directcommerce.eu

I/We [*] hereby give notice that I/We [*] withdraw from my/our [*] contract of sale
of the following goods [*]:
Ordered on [*] / received on [*]:
Name of consumer(s):
Address of consumer(s):
Signature of consumer(s) (only if submitted on paper):
Date:

[*] Delete as appropriate`}
        </pre>
      </section>
    </div>
  );
}
