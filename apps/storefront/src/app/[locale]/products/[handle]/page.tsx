import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../../../lib/i18n";
import { getProductByHandle, STORE_PRODUCTS } from "../../../../lib/catalog";

export async function generateStaticParams() {
  const handles = STORE_PRODUCTS.map((p) => p.handle);
  const locales: SupportedLocale[] = ["de", "fr", "nl", "en"];

  const params: Array<{ locale: string; handle: string }> = [];
  for (const locale of locales) {
    for (const handle of handles) {
      params.push({ locale, handle });
    }
  }
  return params;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const resolved = await params;
  const locale = (resolved.locale || "de") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.de;

  const product = getProductByHandle(resolved.handle) || STORE_PRODUCTS[0];
  if (!product) {
    notFound();
  }

  const variant = product.variants[0];
  const title = product.title[locale] || product.title.en;
  const description = product.description[locale] || product.description.en;

  return (
    <div style={{ maxWidth: "1100px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none", color: "#6b7280" }}>Home</Link>
        {" / "}
        <Link href={`/${locale}#catalog`} style={{ textDecoration: "none", color: "#6b7280" }}>{dict.navProducts}</Link>
        {" / "}
        <span style={{ color: "#111827", fontWeight: 600 }}>{title}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "3rem", alignItems: "start" }}>
        {/* Product Media */}
        <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <img
            src={product.media[0]?.url}
            alt={title}
            style={{ width: "100%", height: "460px", objectFit: "cover" }}
          />
        </div>

        {/* Product Details & Actions */}
        <div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
              {product.brand}
            </span>
            <span style={{ color: "#9ca3af" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>HS: {product.defaultHsCode}</span>
            <span style={{ color: "#9ca3af" }}>•</span>
            <span style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600 }}>Auf Lager</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", margin: "0.25rem 0 1rem 0", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
            {title}
          </h1>

          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", margin: "1rem 0" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#111827" }}>
              {variant?.price.toFixed(2)} €
            </span>
            {variant?.originalPrice && (
              <span style={{ fontSize: "1.1rem", color: "#9ca3af", textDecoration: "line-through" }}>
                {variant.originalPrice.toFixed(2)} €
              </span>
            )}
          </div>

          {/* EU Omnibus Directive Benchmark */}
          <div style={{ display: "inline-block", padding: "0.4rem 0.75rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "0.375rem", color: "#065f46", fontSize: "0.825rem", marginBottom: "1.5rem" }}>
            ✓ {dict.lowestPrice30d}: <strong>{product.omnibus?.lowestPriceLast30Days.toFixed(2)} €</strong>
          </div>

          <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            {description}
          </p>

          {/* Product Specifications */}
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "0.5rem", padding: "1.25rem", border: "1px solid #e5e7eb", marginBottom: "2rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280" }}>Kategorie:</span>
              <span style={{ fontWeight: 600 }}>{product.category}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280" }}>Material / Bauweise:</span>
              <span style={{ fontWeight: 600 }}>{product.material}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Versandart:</span>
              <span style={{ fontWeight: 600 }}>DHL Express / UPS Standard</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link
              href={`/${locale}/checkout?product=${product.handle}`}
              style={{
                display: "block",
                textAlign: "center",
                backgroundColor: "#111827",
                color: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {dict.checkout} (Google Pay & PayPal)
            </Link>
          </div>

          {/* EU Compliance Guarantee */}
          <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.25rem", fontSize: "0.8rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div>🛡️ <strong>{dict.returnNotice}</strong></div>
            <div>🏢 {dict.gpsrTitle}: {product.gpsr?.companyName}, {product.gpsr?.city} ({product.gpsr?.email})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
