import React from "react";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY } from "../../lib/i18n";

export const Footer: React.FC<{ locale: SupportedLocale }> = ({ locale }) => {
  const dict = DICTIONARY[locale] || DICTIONARY.de;
  return (
    <footer style={{ backgroundColor: "#111827", color: "#9ca3af", padding: "3rem 1.5rem 2rem 1.5rem", marginTop: "4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>{dict.brand}</h4>
          <p style={{ fontSize: "0.875rem" }}>{dict.tagline}</p>
        </div>
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>{dict.gpsrTitle}</h4>
          <p style={{ fontSize: "0.85rem" }}>EU Commerce Compliance GmbH<br />Speicherstr. 55, 60327 Frankfurt<br />gpsr@artisanliving.eu</p>
        </div>
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>EU Compliance</h4>
          <p style={{ fontSize: "0.85rem" }}>• {dict.returnNotice}<br />• FSC & EUDR Regulation (EU) 2023/1115</p>
        </div>
      </div>
    </footer>
  );
};
