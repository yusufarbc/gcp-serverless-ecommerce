"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../../lib/i18n";
import { GooglePayButton } from "../../../components/checkout/GooglePayButton";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = ((params?.locale as string) || "de") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.de;

  const [countryCode, setCountryCode] = useState("DE");
  const subtotal = 1290.0;
  const shipping = 120.0;
  const vatRate = countryCode === "DE" ? 0.19 : 0.20;
  const tax = subtotal * vatRate;
  const total = subtotal + tax + shipping;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>{dict.checkout}</h1>
      <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
        <h3>Lieferland (Union OSS KDV)</h3>
        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}>
          <option value="DE">Deutschland (19% MwSt.)</option>
          <option value="FR">France (20% TVA)</option>
          <option value="NL">Nederland (21% BTW)</option>
        </select>
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Zwischensumme:</span><span>{subtotal.toFixed(2)} €</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>2-Man Spedition:</span><span>{shipping.toFixed(2)} €</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>Gesamt:</span><span>{total.toFixed(2)} €</span></div>
        </div>
        <GooglePayButton amount={total} onPaymentSuccess={() => router.push(`/${locale}/order-success`)} />
      </div>
    </div>
  );
}
