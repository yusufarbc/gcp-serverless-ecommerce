import { Storage } from "@google-cloud/storage";
import { GmcFeedItem, GmcFeedConfig } from "@repo/types";

export class GoogleMerchantFeedService {
  private storage: Storage;
  private config: GmcFeedConfig;

  constructor(config: GmcFeedConfig) {
    this.storage = new Storage();
    this.config = config;
  }

  public generateXmlFeed(items: GmcFeedItem[]): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${this.escapeXml(this.config.storeName)}</title>
  <link>${this.escapeXml(this.config.storeUrl)}</link>
  <description>${this.escapeXml(this.config.feedDescription)}</description>`;

    const xmlItems = items
      .map(
        (item) => `
  <item>
    <g:id>${this.escapeXml(item.id)}</g:id>
    <g:title><![CDATA[${item.title}]]></g:title>
    <g:description><![CDATA[${item.description}]]></g:description>
    <g:link>${this.escapeXml(item.link)}</g:link>
    <g:image_link>${this.escapeXml(item.image_link)}</g:image_link>
    <g:price>${item.price}</g:price>
    ${item.sale_price ? `<g:sale_price>${item.sale_price}</g:sale_price>` : ""}
    <g:availability>${item.availability}</g:availability>
    <g:brand><![CDATA[${item.brand}]]></g:brand>
    ${item.gtin ? `<g:gtin>${item.gtin}</g:gtin>` : ""}
    ${item.shipping_weight ? `<g:shipping_weight>${item.shipping_weight}</g:shipping_weight>` : ""}
  </item>`
      )
      .join("");

    const xmlFooter = `
</channel>
</rss>`;

    return `${xmlHeader}${xmlItems}${xmlFooter}`;
  }

  public async uploadFeedToGcs(xmlContent: string, fileName = "feed.xml"): Promise<string> {
    const bucket = this.storage.bucket(this.config.gcsBucketName);
    const file = bucket.file(fileName);

    await file.save(xmlContent, {
      contentType: "application/xml",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=3600",
      },
    });

    return `https://storage.googleapis.com/${this.config.gcsBucketName}/${fileName}`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }
}
