import { GenericOrder, ParcelItem } from "@repo/types";

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

    const name = order.shippingAddress.firstName + " " + order.shippingAddress.lastName;
    const dest = name + ", " + order.shippingAddress.city + ", " + order.shippingAddress.countryCode;

    return {
      exporter: "Artisan Living TR / Export Division",
      consignee: dest,
      countryOfExport: "TR",
      destinationCountry: order.shippingAddress.countryCode,
      hsCode: "9401/9403",
      packagesCount: totalPackages,
      grossWeightKg: totalWeight,
      declarationDate: new Date().toISOString().split("T")[0],
    };
  }

  public generatePackingList(order: GenericOrder) {
    const recipient = order.shippingAddress.firstName + " " + order.shippingAddress.lastName;
    const addr = order.shippingAddress.address1 + ", " + order.shippingAddress.postalCode + " " + order.shippingAddress.city;

    return {
      orderNumber: order.orderNumber,
      date: new Date().toISOString().split("T")[0],
      recipient: recipient,
      destinationAddress: addr,
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
