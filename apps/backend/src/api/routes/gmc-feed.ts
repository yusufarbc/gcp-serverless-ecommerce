import { Router, Request, Response } from "express";
import { GoogleMerchantFeedService } from "../../modules/google-merchant/feed-generator";
import { MOCK_CATALOG } from "./catalog";
import type { GmcFeedItem } from "@repo/types";

export const gmcFeedRouter = Router();

gmcFeedRouter.post("/generate", async (_req: Request, res: Response) => {
  try {
    const bucketName = process.env.GCS_BUCKET_NAME || "gcp-commerce-media";
    const storeUrl = process.env.STOREFRONT_URL || "https://apexstore.eu";
    const storeName = process.env.STORE_NAME || "Apex Direct Europe";

    const feedService = new GoogleMerchantFeedService({
      storeName,
      storeUrl,
      feedDescription: "Automated GMC Next Product Feed - EU D2C Serverless",
      defaultCurrency: "EUR",
      gcsBucketName: bucketName,
    });

    const feedItems: GmcFeedItem[] = MOCK_CATALOG.flatMap((product) =>
      product.variants.map((variant) => {
        const totalWeight = variant.parcels.reduce((s, p) => s + p.weightKg, 0);
        const primaryParcel = variant.parcels[0];

        return {
          id: variant.sku,
          title: `${product.title.en} - ${variant.title}`,
          description: product.description.en,
          link: `${storeUrl}/en/products/${product.handle}`,
          image_link: product.media[0]?.url || "",
          price: `${variant.price.toFixed(2)} EUR`,
          sale_price: variant.originalPrice ? `${variant.price.toFixed(2)} EUR` : undefined,
          availability: variant.inventoryQuantity > 0 ? "in_stock" : "out_of_stock",
          brand: product.brand,
          gtin: variant.barcode,
          mpn: variant.sku,
          condition: "new",
          shipping_weight: `${totalWeight} kg`,
          shipping_length: primaryParcel ? `${primaryParcel.lengthCm} cm` : undefined,
          shipping_width: primaryParcel ? `${primaryParcel.widthCm} cm` : undefined,
          shipping_height: primaryParcel ? `${primaryParcel.heightCm} cm` : undefined,
          transit_time_label: "standard_express_eu",
          custom_label_0: product.eudr?.isWoodProduct ? "EUDR_COMPLIANT" : "STANDARD",
          custom_label_1: variant.customs.hsCode,
          custom_label_2: "2_MAN_HANDLING",
        };
      })
    );

    const xml = feedService.generateXmlFeed(feedItems);
    let publicUrl = "";

    if (process.env.NODE_ENV === "production" || process.env.ENABLE_GCS_UPLOAD === "true") {
      publicUrl = await feedService.uploadFeedToGcs(xml, "feed.xml");
    } else {
      publicUrl = `http://localhost:${process.env.PORT || 9000}/api/gmc/preview`;
    }

    return res.status(200).json({
      success: true,
      message: "GMC XML Feed generated successfully",
      itemsCount: feedItems.length,
      feedUrl: publicUrl,
    });
  } catch (error) {
    console.error("[GMC Feed Error]:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

gmcFeedRouter.get("/preview", (_req: Request, res: Response) => {
  const storeUrl = process.env.STOREFRONT_URL || "https://artisanliving.eu";
  const storeName = process.env.STORE_NAME || "Artisan Living Europe";
  const bucketName = process.env.GCS_BUCKET_NAME || "gcp-commerce-media";

  const feedService = new GoogleMerchantFeedService({
    storeName,
    storeUrl,
    feedDescription: "Automated GMC Next Product Feed - EU D2C Serverless",
    defaultCurrency: "EUR",
    gcsBucketName: bucketName,
  });

  const feedItems: GmcFeedItem[] = MOCK_CATALOG.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.sku,
      title: `${product.title.en} - ${variant.title}`,
      description: product.description.en,
      link: `${storeUrl}/en/products/${product.handle}`,
      image_link: product.media[0]?.url || "",
      price: `${variant.price.toFixed(2)} EUR`,
      availability: "in_stock",
      brand: product.brand,
      gtin: variant.barcode,
    }))
  );

  const xml = feedService.generateXmlFeed(feedItems);
  res.setHeader("Content-Type", "application/xml");
  return res.send(xml);
});
