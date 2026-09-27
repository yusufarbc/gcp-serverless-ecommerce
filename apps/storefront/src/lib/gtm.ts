import { GtmPurchaseEvent, GtmAddToCartEvent, GtmBeginCheckoutEvent, ConsentModeV2Config } from "@repo/types";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function pushDataLayer(data: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
}

export function updateConsentMode(consent: ConsentModeV2Config): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", consent);
  }
}

export function trackAddToCart(ecommerce: GtmAddToCartEvent["ecommerce"]): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event: "add_to_cart", ecommerce });
}

export function trackBeginCheckout(ecommerce: GtmBeginCheckoutEvent["ecommerce"]): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event: "begin_checkout", ecommerce });
}

export function trackPurchase(ecommerce: GtmPurchaseEvent["ecommerce"], user_data?: GtmPurchaseEvent["user_data"]): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event: "purchase", ecommerce, user_data });
}
