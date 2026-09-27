import React from "react";
import { SupportedLocale } from "@repo/types";
import { LOCALES } from "../../lib/i18n";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { ConsentBanner } from "../../components/analytics/ConsentBanner";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalizedLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (LOCALES.includes(resolvedParams.locale as SupportedLocale) ? resolvedParams.locale : "de") as SupportedLocale;

  return (
    <>
      <Navbar locale={locale} />
      <main style={{ minHeight: "80vh" }}>{children}</main>
      <ConsentBanner locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
