"use client";
import React, { useState, useEffect } from "react";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../lib/i18n";
import { updateConsentMode } from "../../lib/gtm";

export const ConsentBanner: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const [visible, setVisible] = useState(false);
  const dict = DICTIONARY[locale] || DICTIONARY.de;

  useEffect(() => {
    if (!localStorage.getItem("gcp_consent_status")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("gcp_consent_status", "all");
    updateConsentMode({ ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("gcp_consent_status", "essential");
    updateConsentMode({ ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: "1rem", right: "1rem", left: "1rem", maxWidth: "500px", margin: "0 auto", backgroundColor: "#111827", color: "white", padding: "1.25rem", borderRadius: "0.5rem", zIndex: 9999 }}>
      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>{dict.cookieTitle}</h3>
      <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#9ca3af" }}>{dict.cookieDesc}</p>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button onClick={reject} style={{ background: "none", color: "#e5e7eb", border: "1px solid #4b5563", padding: "0.4rem 0.8rem", borderRadius: "0.25rem", cursor: "pointer" }}>{dict.rejectNonEssential}</button>
        <button onClick={accept} style={{ background: "#2563eb", color: "white", border: "none", padding: "0.4rem 1rem", borderRadius: "0.25rem", cursor: "pointer" }}>{dict.acceptAll}</button>
      </div>
    </div>
  );
};
