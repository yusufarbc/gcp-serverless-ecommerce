import type { GenericOrder, TwoManLogisticsDetails } from "@repo/types";

export class TwoManHandlingDispatcher {
  public async dispatchOrder(order: GenericOrder, details: TwoManLogisticsDetails) {
    const isBulky = order.items.some((i) => i.parcels?.some((p) => p.weightKg > 30));
    const carrier = details.carrierPartner || (isBulky ? "rhenus" : "dhl_express");
    const trackingNumber = `${carrier.toUpperCase()}_${order.orderNumber}`;
    console.log(`[Logistics Engine] Dispatched order ${order.orderNumber} via ${carrier}. Tracking: ${trackingNumber}`);
    return {
      success: true,
      trackingNumber,
      trackingUrl: `https://tracking.${carrier.replace("_", "")}.com/shipment?id=${trackingNumber}`,
      carrier,
      serviceType: isBulky ? "freight_2man" : "standard_express",
    };
  }
}
