import React from "react";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
      <h1 style={{ color: "#166534" }}>Vielen Dank für Ihre Bestellung!</h1>
      <p style={{ color: "#4b5563" }}>Ihre Bestellung wird vorbereitet und schnellstmöglich mit Sendungsverfolgung versendet.</p>
      <Link href="/de" style={{ display: "inline-block", marginTop: "1.5rem", backgroundColor: "#111827", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.375rem", textDecoration: "none", fontWeight: 600 }}>
        Zurück zum Shop
      </Link>
    </div>
  );
}
