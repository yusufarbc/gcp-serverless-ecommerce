import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../lib/i18n";
import { STORE_PRODUCTS } from "../../lib/catalog";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const resolved = await params;
  const locale = (LOCALES.includes(resolved.locale as SupportedLocale) ? resolved.locale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "3.5rem 1.5rem",
          background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
          color: "white",
          borderRadius: "0.75rem",
          marginBottom: "3rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "0.8rem",
            fontWeight: 700,
            borderRadius: "9999px",
            marginBottom: "1rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          EU Direct-to-Consumer Platform
        </span>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 1rem 0", fontWeight: 800, lineHeight: 1.2 }}>
          {dict.tagline}
        </h1>
        <p style={{ color: "#d1d5db", fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto", lineHeight: 1.6 }}>
          {dict.heroSubtitle}
        </p>

        {/* Value Prop Badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginTop: "2rem",
            fontSize: "0.875rem",
            color: "#9ca3af",
          }}
        >
          <span>🚀 {dict.fastEuShipping}</span>
          <span>•</span>
          <span>🛡️ {dict.moneyBackGuarantee}</span>
          <span>•</span>
          <span>🔒 {dict.secureCheckout}</span>
          <span>•</span>
          <span>🇪🇺 {dict.unionOssVat}</span>
        </div>
      </section>

      {/* Catalog Grid */}
      <section id="catalog">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.85rem", margin: 0, fontWeight: 700 }}>{dict.navProducts}</h2>
            <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>{dict.featuredHighlights}</p>
          </div>
          <span style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: 600 }}>
            {STORE_PRODUCTS.length} {dict.productsAvailable}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {STORE_PRODUCTS.map((p) => {
            const variant = p.variants[0];
            const title = p.title[locale] || p.title.en;
            const description = p.description[locale] || p.description.en;

            return (
              <div
                key={p.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ position: "relative", height: "260px", overflow: "hidden", backgroundColor: "#f3f4f6" }}>
                  <img
                    src={p.media[0]?.url}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      left: "0.75rem",
                      backgroundColor: "rgba(17, 24, 39, 0.85)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {p.category}
                  </span>
                </div>

                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>
                    {p.brand}
                  </span>
                  <h3 style={{ margin: "0.4rem 0", fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>
                    {title}
                  </h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.5, flexGrow: 1 }}>
                    {description}
                  </p>

                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div>
                        <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827" }}>
                          {variant?.price.toFixed(2)} €
                        </span>
                        {variant?.originalPrice && (
                          <span style={{ fontSize: "0.85rem", color: "#9ca3af", textDecoration: "line-through", marginLeft: "0.5rem" }}>
                            {variant.originalPrice.toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                        {dict.inStock}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <Link
                        href={`/${locale}/products/${p.handle}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          backgroundColor: "#111827",
                          color: "white",
                          padding: "0.65rem 1rem",
                          borderRadius: "0.375rem",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {dict.viewDetails}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
