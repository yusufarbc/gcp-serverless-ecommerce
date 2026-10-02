"use client";
import React, { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";
import { GooglePayButton } from "../../../components/checkout/GooglePayButton";
import { PayPalButton } from "../../../components/checkout/PayPalButton";
import { STORE_PRODUCTS } from "../../../lib/catalog";

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedLocale = (params?.locale as string) || "en";
  const locale = (LOCALES.includes(resolvedLocale as SupportedLocale) ? resolvedLocale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  const productHandle = searchParams.get("product") || "aura-pro-anc-headphones";
  const product = STORE_PRODUCTS.find((p) => p.handle === productHandle) || STORE_PRODUCTS[0];

  const defaultCountry = locale === "de" ? "DE" : locale === "fr" ? "FR" : locale === "it" ? "IT" : locale === "es" ? "ES" : locale === "nl" ? "NL" : "DE";
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [paymentMethod, setPaymentMethod] = useState<"google_pay" | "paypal" | "card">("google_pay");

  const subtotal = product ? product.variants[0].price : 249.0;

  // Dynamic EU VAT rates (Union OSS)
  const vatRates: Record<string, number> = {
    DE: 0.19,
    FR: 0.20,
    IT: 0.22,
    ES: 0.21,
    NL: 0.21,
    AT: 0.20,
    BE: 0.21,
    PT: 0.23,
    IE: 0.23,
  };
  const vatRate = vatRates[countryCode] || 0.19;
  const tax = Math.round(subtotal * vatRate * 100) / 100;
  const shipping = subtotal >= 100 ? 0.0 : 9.90;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const handleOrderSuccess = async (paymentDetails?: any) => {
    const generatedOrderNumber = `ORD-EU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CORE_API_URL || "";
      await fetch(`${apiUrl}/api/checkout/process-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: {
            id: `cart_${Date.now()}`,
            items: [
              {
                productId: product.id,
                variantId: product.variants[0].id,
                title: product.title[locale] || product.title.en,
                price: subtotal,
                quantity: 1,
                parcels: product.variants[0].parcels || [],
              },
            ],
          },
          shippingAddress: {
            firstName: "European",
            lastName: "Shopper",
            email: "shopper.eu@example.com",
            address1: "Central Promenade 42",
            city: countryCode === "DE" ? "Berlin" : countryCode === "IT" ? "Milano" : countryCode === "FR" ? "Paris" : "Amsterdam",
            postalCode: "10117",
            countryCode: countryCode,
          },
          paymentMethod: paymentMethod,
          googlePayToken: paymentMethod === "google_pay" ? "TOKEN_DEMO_GPAY" : undefined,
          paypalOrderId: paymentDetails?.orderId,
        }),
      });
    } catch (e) {
      console.warn("Could not post order to backend:", e);
    }
    router.push(`/${locale}/order-success?orderNumber=${generatedOrderNumber}&country=${countryCode}`);
  };

  return (
    <div style={{ maxWidth: "880px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontWeight: 800, color: "#111827" }}>
        {dict.checkout}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
        {/* Left Column: Delivery & Payment Options */}
        <div style={{ backgroundColor: "white", padding: "1.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem", fontWeight: 700 }}>
            {dict.selectCountry}
          </h2>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
            }}
          >
            <option value="DE">Deutschland / Germany (19% MwSt.)</option>
            <option value="FR">France (20% TVA)</option>
            <option value="IT">Italia / Italy (22% IVA)</option>
            <option value="ES">España / Spain (21% IVA)</option>
            <option value="NL">Nederland / Netherlands (21% BTW)</option>
            <option value="AT">Österreich / Austria (20% USt.)</option>
            <option value="BE">België / Belgique / Belgium (21% BTW/TVA)</option>
            <option value="IE">Ireland (23% VAT)</option>
            <option value="PT">Portugal (23% IVA)</option>
          </select>

          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem", fontWeight: 700 }}>
            {dict.selectPayment}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.85rem",
                border: `2px solid ${paymentMethod === "google_pay" ? "#2563eb" : "#e5e7eb"}`,
                borderRadius: "0.5rem",
                cursor: "pointer",
                backgroundColor: paymentMethod === "google_pay" ? "#eff6ff" : "white",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="google_pay"
                checked={paymentMethod === "google_pay"}
                onChange={() => setPaymentMethod("google_pay")}
              />
              <span style={{ fontWeight: 600 }}>Google Pay</span>
              <span style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "auto" }}>{dict.oneClickPayment}</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.85rem",
                border: `2px solid ${paymentMethod === "paypal" ? "#0079c1" : "#e5e7eb"}`,
                borderRadius: "0.5rem",
                cursor: "pointer",
                backgroundColor: paymentMethod === "paypal" ? "#f0f9ff" : "white",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
              />
              <span style={{ fontWeight: 600, color: "#003087" }}>
                Pay<span style={{ color: "#0079c1" }}>Pal</span>
              </span>
              <span style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "auto" }}>{dict.buyerProtection}</span>
            </label>
          </div>

          {/* Payment Execution */}
          {paymentMethod === "google_pay" && (
            <GooglePayButton amount={total} onPaymentSuccess={handleOrderSuccess} />
          )}

          {paymentMethod === "paypal" && (
            <PayPalButton amount={total} onPaymentSuccess={handleOrderSuccess} />
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ backgroundColor: "#f9fafb", padding: "1.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem", fontWeight: 700 }}>
            {dict.orderSummary}
          </h2>

          {product && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
              <img
                src={product.media[0]?.url}
                alt={product.title[locale] || product.title.en}
                style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "0.375rem" }}
              />
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {product.title[locale] || product.title.en}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{dict.quantity}: 1</div>
              </div>
              <div style={{ fontWeight: 700 }}>{subtotal.toFixed(2)} €</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", color: "#4b5563" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{dict.subtotal}:</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{subtotal.toFixed(2)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{dict.vatNotice} ({Math.round(vatRate * 100)}% OSS):</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{tax.toFixed(2)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{dict.shippingExpress}:</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? "#059669" : "#111827" }}>
                {shipping === 0 ? dict.freeShipping : `${shipping.toFixed(2)} €`}
              </span>
            </div>
            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>
              <span>{dict.totalAmount}:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.4 }}>
            ✓ {dict.moneyBackGuarantee}<br />
            ✓ {dict.secureCheckout}<br />
            ✓ {dict.fastEuShipping}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
