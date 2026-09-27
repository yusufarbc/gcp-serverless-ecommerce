import type { GenericOrder, ParcelItem } from "@repo/types";

export class CustomsAndExportService {
  public generateAtrCertificateData(order: GenericOrder) {
    const totalWeight = order.items.reduce(
      (sum: number, item) => sum + item.parcels.reduce((pSum: number, p: ParcelItem) => pSum + p.weightKg, 0) * item.quantity,
      0
    );
    const totalPackages = order.items.reduce(
      (sum: number, item) => sum + item.parcels.length * item.quantity,
      0
    );

    return {
      exporter: `${process.env.STORE_NAME || "Apex Direct Europe"} Export Operations`,
      consignee: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.city}, ${order.shippingAddress.countryCode}`,
      countryOfExport: "TR",
      destinationCountry: order.shippingAddress.countryCode,
      hsCode: "8518/4202/9405",
      packagesCount: totalPackages,
      grossWeightKg: totalWeight,
      declarationDate: new Date().toISOString().split("T")[0],
    };
  }

  public generatePackingList(order: GenericOrder) {
    return {
      orderNumber: order.orderNumber,
      date: new Date().toISOString().split("T")[0],
      recipient: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      destinationAddress: `${order.shippingAddress.address1}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}`,
      items: order.items.flatMap((i) =>
        i.parcels.map((p: ParcelItem) => ({
          title: i.title,
          box: p.boxNumber,
          desc: p.boxDescription,
          weightKg: p.weightKg,
        }))
      ),
    };
  }
}
