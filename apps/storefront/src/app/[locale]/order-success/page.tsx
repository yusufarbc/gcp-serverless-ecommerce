import React from "react";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb", textAlign: "center" }}>
      <h1 style={{ color: "#166534" }}>Vielen Dank für Ihre Bestellung!</h1>
      <p style={{ color: "#6b7280" }}>Ihre 2-Man Speditionslieferung wird vorbereitet.</p>
      <Link href="/de" style={{ display: "inline-block", marginTop: "1rem", backgroundColor: "#111827", color: "white", padding: "0.6rem 1.2rem", borderRadius: "0.25rem", textDecoration: "none" }}>
        Zurück zur Startseite
      </Link>
    </div>
  );
}
