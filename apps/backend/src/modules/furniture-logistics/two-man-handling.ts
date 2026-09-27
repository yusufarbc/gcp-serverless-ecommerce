import type { GenericOrder, TwoManLogisticsDetails } from "@repo/types";

export class TwoManHandlingDispatcher {
  public async dispatchOrder(order: GenericOrder, details: TwoManLogisticsDetails) {
    const carrier = details.carrierPartner || "rhenus";
    const trackingNumber = `TMH_${carrier.toUpperCase()}_${order.orderNumber}`;
    console.log(`[2-Man Logistics] Dispatched ${order.orderNumber} to ${carrier}. Tracking: ${trackingNumber}`);
    return {
      success: true,
      trackingNumber,
      trackingUrl: `https://tracking.${carrier}.com/shipment?id=${trackingNumber}`,
      carrier,
    };
  }
}
