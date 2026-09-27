import { Router, Request, Response } from "express";
import type { GenericProduct } from "@repo/types";

export const catalogRouter = Router();

// Generic sample catalog for EU D2C Furniture / Retail
export const MOCK_CATALOG: GenericProduct[] = [
  {
    id: "prod_solid_oak_table_01",
    handle: "solid-oak-dining-table",
    title: {
      de: "Massivholz Eichentisch Artisan",
      fr: "Table à Manger en Chêne Massif Artisan",
      nl: "Massief Eiken Eettafel Artisan",
      en: "Artisan Solid Oak Dining Table",
    },
    description: {
      de: "Handgefertigter Esstisch aus 100% FSC-zertifiziertem europäischem Eichenholz mit geölter Oberfläche.",
      fr: "Table à manger artisanale en chêne massif européen 100% certifié FSC avec finition huilée.",
      nl: "Ambachtelijke eettafel van 100% FSC-gecertificeerd Europees eikenhout met geoliede afwerking.",
      en: "Handcrafted dining table made of 100% FSC-certified European solid oak with natural oiled finish.",
    },
    brand: "Artisan Living",
    category: "Dining Room",
    defaultHsCode: "9403.60.10", // Wooden furniture for dining rooms
    material: "FSC Certified European Oak",
    assemblyRequired: true,
    returnPolicyDays: 14,
    estimatedReturnCostEur: 89.0, // BGB § 357(5) bulky return notice
    media: [
      {
        id: "media_oak_table_01",
        url: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80",
        altText: "Solid Oak Dining Table",
      },
      {
        id: "media_oak_table_3d",
        url: "https://storage.googleapis.com/gcp-commerce-media/models/oak-table.usdz",
        is3dModel: true,
        modelFormat: "usdz",
        altText: "3D AR View for iOS",
      },
    ],
    variants: [
      {
        id: "var_oak_table_200",
        sku: "TBL-OAK-200",
        title: "200cm x 100cm (6-8 Person)",
        barcode: "8680001234567",
        price: 1290.0,
        originalPrice: 1490.0,
        inventoryQuantity: 24,
        parcels: [
          {
            boxNumber: 1,
            boxDescription: "Tischplatte (Tabletop)",
            weightKg: 52.0,
            lengthCm: 210,
            widthCm: 110,
            heightCm: 12,
            desi: 55.4,
          },
          {
            boxNumber: 2,
            boxDescription: "Tischbeine & Montageset (Legs & Hardware)",
            weightKg: 18.0,
            lengthCm: 85,
            widthCm: 25,
            heightCm: 25,
            desi: 10.6,
          },
        ],
        customs: {
          hsCode: "9403.60.10",
          countryOfOrigin: "TR",
          atrEligible: true,
          grossWeightKg: 70.0,
          netWeightKg: 65.0,
          packagesCount: 2,
        },
      },
    ],
    eudr: {
      isWoodProduct: true,
      scientificTreeSpecies: "Quercus robur (European Oak)",
      countryOfHarvest: "TR",
      tracesNtReference: "TRACES-EUDR-2026-TR-884910",
      fscOrPefcCertificateNumber: "FSC-C123456",
      forestGpsCoordinates: [
        { latitude: 40.0825, longitude: 29.5108 },
        { latitude: 40.085, longitude: 29.5135 },
      ],
    },
    gpsr: {
      companyName: "EU Commerce Compliance Services GmbH",
      legalRepresentative: "Dr. Klaus Schneider",
      addressLine1: "Westhafen Tower, Speicherstraße 55",
      postalCode: "60327",
      city: "Frankfurt am Main",
      country: "Germany",
      email: "gpsr-rep@eurliving.de",
    },
    omnibus: {
      lowestPriceLast30Days: 1290.0,
      currency: "EUR",
      validFrom: "2026-08-25T00:00:00Z",
      validTo: "2026-09-25T00:00:00Z",
    },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-09-27T00:00:00Z",
  },
  {
    id: "prod_scandi_lounge_sofa_02",
    handle: "scandi-linen-lounge-sofa",
    title: {
      de: "Skandi 3-Sitzer Sofa Keten",
      fr: "Canapé 3 Places Scandinave en Lin",
      nl: "Scandinavische 3-Zits Linnen Bank",
      en: "Scandi 3-Seater Natural Linen Sofa",
    },
    description: {
      de: "Modulares 3-Sitzer Sofa mit atmungsaktivem Naturleinenbezug und hochbelastbarem Buchenholzrahmen.",
      fr: "Canapé 3 places modulable avec revêtement en lin naturel et structure en hêtre robuste.",
      nl: "Modulaire 3-zits bank met ademende linnen bekleding en massief beukenhouten frame.",
      en: "Modular 3-seater sofa with breathable natural linen fabric and heavy-duty beechwood internal frame.",
    },
    brand: "Artisan Living",
    category: "Living Room",
    defaultHsCode: "9401.61.00", // Upholstered seats with wooden frames
    material: "Natural Linen & Solid Beech",
    assemblyRequired: false,
    returnPolicyDays: 14,
    estimatedReturnCostEur: 110.0,
    media: [
      {
        id: "media_sofa_01",
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        altText: "Scandi Natural Linen Sofa",
      },
    ],
    variants: [
      {
        id: "var_sofa_beige",
        sku: "SOFA-SCANDI-BEIGE",
        title: "Beige Natur / 230cm",
        barcode: "8680001234568",
        price: 1850.0,
        originalPrice: 2100.0,
        inventoryQuantity: 15,
        parcels: [
          {
            boxNumber: 1,
            boxDescription: "Sofa Hauptkörper (Main Body)",
            weightKg: 68.0,
            lengthCm: 235,
            widthCm: 95,
            heightCm: 75,
            desi: 111.6,
          },
        ],
        customs: {
          hsCode: "9401.61.00",
          countryOfOrigin: "TR",
          atrEligible: true,
          grossWeightKg: 72.0,
          netWeightKg: 68.0,
          packagesCount: 1,
        },
      },
    ],
    gpsr: {
      companyName: "EU Commerce Compliance Services GmbH",
      legalRepresentative: "Dr. Klaus Schneider",
      addressLine1: "Westhafen Tower, Speicherstraße 55",
      postalCode: "60327",
      city: "Frankfurt am Main",
      country: "Germany",
      email: "gpsr-rep@eurliving.de",
    },
    omnibus: {
      lowestPriceLast30Days: 1850.0,
      currency: "EUR",
      validFrom: "2026-08-25T00:00:00Z",
      validTo: "2026-09-25T00:00:00Z",
    },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-09-27T00:00:00Z",
  },
];

catalogRouter.get("/products", (_req: Request, res: Response) => {
  res.status(200).json({ products: MOCK_CATALOG });
});

catalogRouter.get("/products/:handle", (req: Request, res: Response) => {
  const product = MOCK_CATALOG.find((p) => p.handle === req.params.handle);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  return res.status(200).json({ product });
});
