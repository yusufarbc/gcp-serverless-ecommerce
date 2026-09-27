import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../../../lib/i18n";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const resolved = await params;
  const locale = (resolved.locale || "de") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.de;

  const product = {
    title: locale === "de" ? "Massivholz Eichentisch Artisan" : "Artisan Solid Oak Dining Table",
    price: 1290.0,
    brand: "Artisan Living",
    hsCode: "9403.60.10",
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=80"
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
        <img src={product.image} alt={product.title} style={{ width: "100%", borderRadius: "0.5rem", height: "400px", objectFit: "cover" }} />
        <div>
          <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem" }}>{product.brand} • HS: {product.hsCode}</span>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{product.title}</h1>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, margin: "1rem 0" }}>{product.price.toFixed(2)} €</div>
          <p style={{ color: "#059669", fontSize: "0.85rem" }}>✓ {dict.lowestPrice30d}: 1290.00 €</p>
          <div style={{ margin: "1rem 0", padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "0.375rem", fontSize: "0.85rem", color: "#166534" }}>
            🌲 <strong>EUDR Konform:</strong> 100% FSC Eichenholz, TRACES NT zertifiziert.
          </div>
          <Link href={`/${locale}/checkout`} style={{ display: "block", textAlign: "center", backgroundColor: "#111827", color: "white", padding: "0.875rem", borderRadius: "0.375rem", textDecoration: "none", fontWeight: 600 }}>
            {dict.checkout} (Google Pay)
          </Link>
        </div>
      </div>
    </div>
  );
}
