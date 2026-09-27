import React from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../lib/i18n";

const MOCK_PRODUCTS = [
  {
    id: "prod_solid_oak_table_01",
    handle: "solid-oak-dining-table",
    title: { de: "Massivholz Eichentisch Artisan", en: "Artisan Solid Oak Dining Table", fr: "Table à Manger en Chêne Massif", nl: "Massief Eiken Eettafel" },
    description: { de: "Handgefertigter Esstisch aus 100% FSC-zertifiziertem Eichenholz.", en: "Handcrafted solid oak dining table.", fr: "Table à manger en chêne massif.", nl: "Ambachtelijke massief eiken eettafel." },
    price: 1290.0,
    brand: "Artisan Living",
    image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "prod_scandi_lounge_sofa_02",
    handle: "scandi-linen-lounge-sofa",
    title: { de: "Skandi 3-Sitzer Sofa Keten", en: "Scandi 3-Seater Natural Linen Sofa", fr: "Canapé 3 Places Scandinave en Lin", nl: "Scandinavische 3-Zits Linnen Bank" },
    description: { de: "Modulares 3-Sitzer Sofa mit Naturleinenbezug.", en: "Modular 3-seater sofa with natural linen fabric.", fr: "Canapé 3 places en lin.", nl: "Modulaire 3-zits bank." },
    price: 1850.0,
    brand: "Artisan Living",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
  }
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const resolved = await params;
  const locale = (resolved.locale || "de") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.de;

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <section style={{ textAlign: "center", padding: "3rem 1rem", backgroundColor: "#111827", color: "white", borderRadius: "0.75rem", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 1rem 0" }}>{dict.tagline}</h1>
        <p style={{ color: "#9ca3af" }}>FSC & EUDR Konform • 2-Man Handling bis ins Wohnzimmer</p>
      </section>

      <section id="catalog">
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>{dict.navProducts}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {MOCK_PRODUCTS.map((p) => (
            <div key={p.id} style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "white" }}>
              <img src={p.image} alt={p.title[locale] || p.title.en} style={{ width: "100%", height: "240px", objectFit: "cover" }} />
              <div style={{ padding: "1.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>{p.brand}</span>
                <h3 style={{ margin: "0.25rem 0", fontSize: "1.2rem" }}>{p.title[locale] || p.title.en}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{p.description[locale] || p.description.en}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <span style={{ fontSize: "1.3rem", fontWeight: 700 }}>{p.price.toFixed(2)} €</span>
                  <Link href={`/${locale}/products/${p.handle}`} style={{ backgroundColor: "#111827", color: "white", padding: "0.5rem 1rem", borderRadius: "0.25rem", textDecoration: "none", fontSize: "0.85rem" }}>
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
