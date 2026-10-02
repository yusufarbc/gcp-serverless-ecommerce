"use client";
import React from "react";

export const GooglePayButton: React.FC<{
  amount: number;
  currency?: string;
  countryCode?: string;
  onPaymentSuccess: (data: unknown) => void;
}> = ({ amount, onPaymentSuccess }) => {
  return (
    <button
      onClick={() => onPaymentSuccess({ status: "SUCCESS", method: "GOOGLE_PAY" })}
      style={{ width: "100%", height: "48px", backgroundColor: "#111827", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
    >
      <span>💳 Mit Google Pay bezahlen ({amount.toFixed(2)} €)</span>
    </button>
  );
};
