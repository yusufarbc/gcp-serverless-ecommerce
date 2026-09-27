import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../lib/i18n";

export const Navbar: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const dict = DICTIONARY[locale] || DICTIONARY.de;
  return (
    <header style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#111827", fontWeight: 700, fontSize: "1.25rem" }}>
          {dict.brand}
        </Link>
        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link href={`/${locale}#catalog`} style={{ textDecoration: "none", color: "#4b5563" }}>{dict.navProducts}</Link>
          <Link href={`/${locale}/checkout`} style={{ textDecoration: "none", color: "#4b5563" }}>{dict.cart} (1)</Link>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {LOCALES.map((l) => (
              <Link key={l} href={`/${l}`} style={{ textDecoration: "none", fontSize: "0.85rem", fontWeight: l === locale ? 700 : 400, color: l === locale ? "#2563eb" : "#6b7280" }}>
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};
