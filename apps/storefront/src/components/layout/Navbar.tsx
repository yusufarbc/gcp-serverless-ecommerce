import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../lib/i18n";

export const Navbar: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const dict = DICTIONARY[locale] || DICTIONARY.en;
  return (
    <header style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#ffffff", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#111827", fontWeight: 800, fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🇪🇺</span>
          <span>{dict.brand}</span>
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href={`/${locale}#catalog`} style={{ textDecoration: "none", color: "#4b5563", fontSize: "0.95rem", fontWeight: 500 }}>
            {dict.navProducts}
          </Link>
          <Link href={`/${locale}/checkout`} style={{ textDecoration: "none", color: "#4b5563", fontSize: "0.95rem", fontWeight: 500 }}>
            {dict.cart} (1)
          </Link>
          <Link href={`/${locale}/support`} style={{ textDecoration: "none", color: "#4b5563", fontSize: "0.95rem", fontWeight: 500 }}>
            {dict.support}
          </Link>

          {/* Prominent EU Language Switcher */}
          <div style={{ display: "flex", gap: "0.35rem", backgroundColor: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "9999px" }}>
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                style={{
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontWeight: l === locale ? 700 : 500,
                  color: l === locale ? "#ffffff" : "#4b5563",
                  backgroundColor: l === locale ? "#2563eb" : "transparent",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "9999px",
                  transition: "all 0.15s ease",
                }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};
