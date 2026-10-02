# ARCHITECTURAL AND OPERATIONAL SPECIFICATION: GOOGLE CLOUD SERVERLESS EU D2C E-COMMERCE PLATFORM

This document outlines the end-to-end architecture and operational blueprint for a high-performance, cost-optimized, and fully serverless Direct-to-Consumer (D2C) e-commerce platform targeted at the European Union and Schengen markets. Built entirely on Google Cloud Platform (GCP) and containerized with Docker, the infrastructure is engineered with a strict **Scale-to-Zero** design, guaranteeing $0 idle infrastructure costs while adhering to mandatory EU legal and technical frameworks.

---

## 1. System Topology & End-to-End Data Flow

The platform decouples the presentation layer from the headless commerce backend, orchestrating data through event-driven serverless services, first-party telemetry, and automated compliance pipelines:

```
                                  [ European Consumer (Mobile / Desktop PWA) ]
                                                       │
                      ┌────────────────────────────────┴────────────────────────────────┐
                      │                                                                 │
       (1. PWA & Dynamic SSR Requests)                                     (2. Telemetry & Consent Data)
                      │                                                                 │
                      ▼                                                                 ▼
           [ Cloud CDN / Edge ]                                                [ Client-Side GTM ]
       (Anycast Edge Caching / SSL)                                           (Consent Mode v2 Layer)
                      │                                                                 │
                      ├────────────────────────────────┐                                │ (First-Party HTTPS POST)
                      ▼                                ▼                                ▼
          [ Cloud Run: Storefront ]        [ Cloud Run: Core API ]          [ Cloud Run: Server-Side GTM ]
          (Next.js 15 PWA / App Shell)     (Headless Commerce Engine)       (ss.store.eu / Scale-to-Zero)
                      │                                │                                │
                      │ (Serverless VPC Connector)     │                                ├──────────────────────────┐
                      ▼                                ▼                                ▼                          ▼
           [ Cloud Storage (GCS) ]         [ Cloud SQL: Postgres ]                   [ GA4 ]                 [ Google Ads ]
         (Media, PDF Invoices, Feeds)     (europe-west3 / Frankfurt)            (BigQuery Export)       (Enhanced Conversions)
                      ▲                                │                                │                          ▲
                      │                                ▼                                ▼                          │
           [ Scheduled XML Feed ]          [ Cloud Tasks / Queues ]             [ BigQuery ML ] ───────────────┘
          (Google Merchant Center)        (Order & Email Asynchronous Tasks)    (Audience Modeling / Looker)
```

---

## 2. Google Cloud Platform (GCP) Infrastructure & EU Data Sovereignty

All infrastructure components are provisioned in the **Frankfurt am Main (`europe-west3`)** region of Google Cloud Platform. This ensures strict adherence to the General Data Protection Regulation (GDPR) data sovereignty requirements while minimizing network latency across Central, Western, and Southern Europe (Germany, France, Italy, Spain, Benelux).

Every compute service is provisioned with `min-instances: 0` to preserve a zero-cost baseline when idle:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        GCP PROJECT: gcp-serverless-ecommerce                           │
│                        Region: europe-west3 (Frankfurt, Germany)                       │
├────────────────────────────────┬───────────────────────────────┬───────────────────────┤
│ 1. COMPUTE LAYER               │ 2. DATA & STORAGE             │ 3. ASYNC & SECURITY   │
│ • Cloud Run: Storefront PWA    │ • Cloud SQL: PostgreSQL       │ • Serverless VPC      │
│ • Cloud Run: Core API          │ • Cloud Storage (GCS Standard)│ • Cloud Tasks         │
│ • Cloud Run: Server-Side GTM   │ • Secret Manager              │ • Cloud Scheduler     │
│ • Cloud CDN & Cloud Armor      │ • BigQuery (EU Multi-Region)  │ • Cloud DNS & SSL     │
└────────────────────────────────┴───────────────────────────────┴───────────────────────┘
```

### 2.1. Compute Architecture (Serverless Cloud Run)
* **Storefront PWA (`commerce-storefront-pwa`):** Next.js 15 App Router providing localized Server-Side Rendering (SSR) and Static Site Generation (SSG). Concurrency: 80, CPU: 1, Memory: 512Mi.
* **Core API Engine (`commerce-core-api`):** Express / MedusaJS TypeScript backend handling catalog endpoints, dynamic EU VAT calculations, customs documents, and payment processing. Concurrency: 40, CPU: 1, Memory: 1Gi.
* **Server-Side GTM (`commerce-sgtm`):** First-party telemetry container mapping conversion tracking through user-owned domains to bypass third-party cookie restrictions.

### 2.2. CI/CD & Workload Identity Federation (WIF)
Long-lived service account JSON keys are strictly disabled via organization policy `constraints/iam.disableServiceAccountKeyCreation`. Deployments utilize **Keyless Workload Identity Federation (WIF)**:
* **OIDC Pool:** `projects/989797182050/locations/global/workloadIdentityPools/github-pool`
* **OIDC Provider:** `projects/989797182050/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
* **Service Account:** `github-actions-deployer@gcp-serverless-ecommerce.iam.gserviceaccount.com`
* **GitHub Repository:** `yusufarbc/gcp-serverless-ecommerce` (automated pipelines for `main`, `production`, and `staging`).

---

## 3. European Union Regulatory & Legal Compliance Framework

To operate seamlessly and legally in the EU Single Market, the platform enforces compliance at the code and database level:

### 3.1. General Data Protection Regulation (GDPR - Regulation (EU) 2016/679)
* **Google Consent Mode v2 (Deny-by-Default):** Prior to user action, all four privacy consent parameters (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) are hardcoded to `denied`.
* **Explicit User Choice:** An accessible consent modal provides equal prominence to &quot;Accept All&quot; and &quot;Essential Only&quot; options.
* **Statutory Privacy Notice (Art. 13 & 14):** Dedicated `/privacy` endpoint outlining data controller details, processing purposes, retention schedules, and EU supervisory authority complaint channels.

### 3.2. EU Union One-Stop-Shop (OSS) Dynamic VAT Calculation
Under Council Directive (EU) 2017/2455, cross-border B2C e-commerce in the EU is taxed at the destination member state rate when annual intra-EU sales exceed €10,000:
* Destination-based VAT calculated in real-time upon delivery country selection:
  * Germany (`DE`): 19%
  * France (`FR`): 20%
  * Italy (`IT`): 22%
  * Spain (`ES`): 21%
  * Netherlands (`NL`): 21%
  * Austria (`AT`): 20%
  * Belgium (`BE`): 21%
* Itemized tax reporting generated automatically for single quarterly Union OSS tax returns.

### 3.3. General Product Safety Regulation (GPSR - Regulation (EU) 2023/988)
For any product sold into the EU, an EU-established economic operator must be identified:
* **Responsible Person Metadata:** Every product record contains verified EU legal representative contact info (`companyName`, `address`, `postalCode`, `city`, `email`).
* **Product Detail Page (PDP) Display:** Mandatory display of compliance credentials on all product views.

### 3.4. EU Price Indication / Omnibus Directive (Directive (EU) 2019/2161)
* **30-Day Historical Lowest Price:** Any promotional discount or strike-through price displays the lowest prior price applied during a period of not less than 30 days before the price reduction (`lowestPriceLast30Days`).

### 3.5. Statutory 14-Day Right of Withdrawal (Directive 2011/83/EU)
* **Clear Consumer Information:** Pre-contractual withdrawal notice and standardized Model Withdrawal Form available on `/withdrawal` and during checkout.
* **Consolidation Hub Routing:** Returned parcels are directed to an EU-based consolidation warehouse in Germany.

---

## 4. Prominent European Languages & Multilingual SEO

The platform natively supports the **6 prominent European languages**, covering over 80% of EU purchasing power:

| Locale Code | Language | Primary Member State Markets |
| :---: | :--- | :--- |
| **`en`** | English | Pan-EU Lingua Franca, Ireland, Malta |
| **`de`** | German | Germany, Austria, Switzerland, Luxembourg, Belgium |
| **`fr`** | French | France, Belgium, Luxembourg |
| **`it`** | Italian | Italy, Switzerland, San Marino |
| **`es`** | Spanish | Spain |
| **`nl`** | Dutch | Netherlands, Belgium (Flanders) |

### 4.1. Technical SEO & Hreflang Configuration
* Dynamic `hreflang` headers and alternate link tags are rendered for every localized route.
* Schema.org `Product` JSON-LD microdata with `Offer`, `AggregateRating`, and `brand` tags embedded server-side for Google Rich Results.

---

## 5. Payment Orchestration & Regional Methods

The checkout pipeline balances friction-free 1-click purchases with high conversion in specific European markets:

```
[ Consumer Shopping Cart ]
          │
          ├──> [ Google Pay Web API (1-Click Tokenization via Stripe) ]
          │
          ├──> [ PayPal Checkout v2 REST API (Buyer Protection) ]
          │
          └──> [ Regional EU Methods (iDEAL for NL, Bancontact for BE, Klarna BNPL) ]
```

* **Google Pay Web API:** Zero cardholder data stored on merchant servers. Client-side payment token encrypted directly for the payment processor (Stripe).
* **PayPal REST API v2:** Automated order capture (`/api/checkout/paypal/create-order` and `/api/checkout/paypal/capture-order`) with buyer protection guarantees.
* **Fallback Simulation:** In the absence of live API credentials in staging, fallback sandbox logic enables complete end-to-end verification without disruption.

---

## 6. Customs & Logistics Architecture (EU-Turkey Customs Union)

For goods manufactured under the EU-Turkey Customs Union framework:
* **Harmonized System (HS) Codes:** Each SKU is annotated with its 6-to-8 digit HS Code (e.g., `8518.30.00` for headphones, `4202.92.00` for backpacks).
* **A.TR Movement Certificate Automation:** Automatic generation of customs declaration payloads for industrial products eligible for zero-tariff preferential entry.
* **Parcels & Volumetric Weight:** Multi-box dimensions, gross/net weight, and volumetric divisor calculations (`(L x W x H) / 5000`) for DHL Express and 2-Man bulky logistics.

---

## 7. Google Merchant Center (GMC) Product Feed Engine

An automated XML feed service generates fully compliant Google Shopping feeds according to Google Merchant Center specifications:
* **Endpoint:** `GET /api/gmc/feed.xml`
* **Attributes:** `id`, `title`, `description`, `link`, `image_link`, `price`, `availability`, `brand`, `gtin` / `barcode`, `custom_label_0` (EU Compliance), `custom_label_1` (HS Code), `custom_label_2` (`2_MAN_BULKY` vs `STANDARD_PARCEL`).
* **Direct GCS Sync:** Scheduled asynchronous upload to Google Cloud Storage (`gs://gcp-serverless-ecommerce-media/feed.xml`) for scheduled Google Shopping crawls.

---

## 8. FinOps Cost Structure (Scale-to-Zero Simulation)

At low-to-medium baseline volume (15,000–30,000 monthly unique visitors), the system guarantees near-zero cloud expenses:

| Service | Architecture & Sizing | Estimated Monthly Idle Cost |
| :--- | :--- | :---: |
| **Cloud Run: Storefront** | Next.js PWA, `min-instances: 0` | **$0.00** (Free Tier) |
| **Cloud Run: Core API** | Node/TypeScript, `min-instances: 0` | **$0.00** (Free Tier) |
| **Cloud Storage (GCS)** | Media & Invoices (~10 GB) | **$0.20** |
| **Cloud Tasks & Scheduler** | Async order queues & XML cron | **$0.00** (First 1M tasks free) |
| **Secret Manager** | 5 production secrets | **$0.30** |
| **Workload Identity Federation** | Keyless OIDC authentication | **$0.00** (Included) |
| **TOTAL IDLE CLOUD COST** | **Fully Serverless Infrastructure** | **<$1.00 / Month** |

*(Note: Adding an optional dedicated 24/7 Cloud SQL db-f1-micro instance introduces an infrastructure baseline of ~$15–$25/month. Alternatively, serverless PostgreSQL or Firestore preserves the $0 scale-to-zero model).*