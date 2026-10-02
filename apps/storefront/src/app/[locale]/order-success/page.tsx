import React, { Suspense } from "react";
import Link from "next/link";
import { SupportedLocale } from "@repo/types";
import { DICTIONARY, LOCALES } from "../../../lib/i18n";
import { OrderSuccessClient } from "./OrderSuccessClient";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = (LOCALES.includes(resolved.locale as SupportedLocale) ? resolved.locale : "en") as SupportedLocale;
  const dict = DICTIONARY[locale] || DICTIONARY.en;

  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem" }}>Loading confirmation...</div>}>
      <OrderSuccessClient locale={locale} dict={dict} />
    </Suspense>
  );
}
