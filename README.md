# gcp-serverless-ecommerce
Enterprise-grade, cost-optimized, and fully serverless e-commerce platform powered by Google Cloud Platform (GCP) and Google Workspace.

### Recommended Repository Names

* **`gcp-serverless-commerce`** *(Recommended: Clear, memorable, standard open-source naming)*
* **`open-commerce-gcp`** *(Emphasizes the open-source community aspect)*
* **`cloudrun-commerce-stack`** *(Highlights the primary compute engine and architecture)*

---

### Complete Open-Source Repository Architecture

```text
gcp-serverless-commerce/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                        # Lint, typecheck, format, test
│       ├── deploy-backend.yml            # Build & deploy Core API to Cloud Run
│       ├── deploy-storefront.yml         # Build & deploy Next.js PWA to Cloud Run / Firebase
│       ├── deploy-sgtm.yml               # Deploy Server-Side GTM container to Cloud Run
│       └── terraform-pipeline.yml        # Terraform plan (PR) & apply (main)
│
├── apps/
│   ├── backend/                          # Headless Commerce Engine (MedusaJS v2 Core)
│   │   ├── src/
│   │   │   ├── api/                      # Custom REST endpoints, webhooks, health checks
│   │   │   ├── modules/                  # Extensible plugins (Payments, Tax, Shipping, GMC Feeds)
│   │   │   │   ├── google-merchant/      # Automated product feed exporter (XML/JSON to GCS)
│   │   │   │   ├── payment-googlepay/    # Google Pay token verification & gateway routing
│   │   │   │   └── tax-provider/         # Multi-region dynamic tax calculation engine
│   │   │   ├── services/                 # Background jobs, Cloud Tasks handlers
│   │   │   └── medusa-config.js
│   │   ├── Dockerfile                    # Multi-stage production container build
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── storefront/                       # Modern Next.js 15 PWA Storefront
│       ├── public/
│       │   ├── icons/                    # App icons (192x192, 512x512, maskable)
│       │   ├── manifest.json             # Web App Manifest (PWA standalone config)
│       │   ├── offline.html              # Service worker offline fallback
│       │   └── .well-known/
│       │       └── assetlinks.json       # Trusted Web Activity (TWA) verification
│       ├── src/
│       │   ├── app/                      # Next.js App Router (i18n localized paths: /[locale]/...)
│       │   │   ├── [locale]/
│       │   │   │   ├── (catalog)/        # Product listing & details with Schema.org JSON-LD
│       │   │   │   ├── checkout/         # Google Pay Web API, Cards, Local payments
│       │   │   │   └── layout.tsx        # Consent Mode v2 & first-party GTM injection
│       │   │   └── sw.ts                 # Serwist-powered Service Worker caching strategies
│       │   ├── components/
│       │   │   ├── analytics/            # Cookie banner, Consent Mode toggles
│       │   │   └── checkout/             # Google Pay button & checkout forms
│       │   ├── lib/
│       │   │   ├── gtm.ts                # Type-safe eCommerce Data Layer pushers
│       │   │   └── medusa.ts             # API client with ISR/SSR fetch hooks
│       │   ├── Dockerfile
│       │   ├── next.config.mjs
│       │   └── package.json
│
├── config/
│   ├── gtm/
│   │   ├── web-container-template.json   # Exported GTM Web Container (GA4, Consent Mode, Ads)
│   │   └── server-container-template.json# Exported sGTM Server Container (Enhanced Conversions)
│   └── workspace/
│       └── sheets-feed-sync.gs           # Apps Script: Syncs Google Sheets inventory with GMC
│
├── infra/
│   └── terraform/                        # Production-ready Terraform (GCP Provider)
│       ├── environments/
│       │   ├── prod/
│       │   │   ├── backend.tf            # State storage in Cloud Storage (GCS)
│       │   │   ├── main.tf               # Root environment orchestration
│       │   │   ├── outputs.tf
│       │   │   └── variables.tf
│       │   └── staging/
│       └── modules/
│           ├── cloud_run/                # Cloud Run services (Scale-to-zero configs)
│           ├── cloud_sql/                # PostgreSQL db-f1-micro with Private IP
│           ├── cloud_storage/            # Media bucket, lifecycle rules, CDN integration
│           ├── networking/               # VPC, Serverless VPC Access Connector
│           ├── secret_manager/           # Secrets & environment configurations
│           ├── tasks_scheduler/          # Cloud Tasks queue & Cloud Scheduler CRON jobs
│           └── workload_identity/        # Keyless GitHub Actions OIDC authentication
│
├── packages/
│   ├── eslint-config/
│   ├── tsconfig/
│   └── types/                            # Shared data models (Products, Cart, Checkout, Events)
│
├── .dockerignore
├── .gitignore
├── docker-compose.yml                    # Local full-stack runtime (Postgres + Backend + Storefront)
├── LICENSE                               # MIT or Apache 2.0
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── turbo.json

```

---

### `README.md` (Open-Source Project Frontpage)

```markdown
# GCP Serverless Commerce Stack

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Infrastructure: GCP](https://img.shields.io/badge/Infrastructure-Google%20Cloud-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Framework: Next.js 15](https://img.shields.io/badge/Storefront-Next.js%2015%20PWA-black?logo=next.js)](https://nextjs.org/)
[![Engine: MedusaJS](https://img.shields.io/badge/Engine-MedusaJS%20v2-purple)](https://medusajs.com/)
[![CI/CD: GitHub Actions](https://img.shields.io/badge/CI%2FCD-Workload%20Identity-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

An open-source, enterprise-grade, fully serverless e-commerce platform designed to run 100% on **Google Cloud Platform (GCP)** and integrate natively with the **Google Workspace & Marketing Ecosystem**. 

Engineered with a **FinOps-first philosophy**: all workloads scale to zero when idle, keeping base running costs under **$25/month** on production while scaling dynamically to absorb peak traffic.

---

## Architecture Overview


```

```
                              [ Global User / Browser ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
         (1. Web Traffic & SSR)                         (2. First-Party Telemetry)
                  │                                               │
                  ▼                                               ▼
      [ Firebase Hosting & CDN ]                        [ Client-Side GTM ]
    (Anycast Edge Caching / SSL)                       (Consent Mode v2 CMP)
                  │                                               │
       ┌──────────┴──────────┐                                    │ (HTTPS POST)
       ▼                     ▼                                    ▼

```

[ Cloud Run: Web ]    [ Cloud Run: API ]              [ Cloud Run: Server-Side GTM ]
(Next.js 15 PWA)      (Medusa Core API)               (First-Party ss.domain.com)
│                     │                                    │
│ (VPC Access)        ├───────────────┐                    ├──────────────────────────┐
▼                     ▼               ▼                    ▼                          ▼
[ Cloud Storage ]     [ Cloud SQL ]    [ Cloud Tasks ]           [ GA4 ]                 [ Google Ads ]
(Media Assets / CDN)  (PostgreSQL 16)  (Async Queues)      (BigQuery Streaming)     (Enhanced Conversions)

```

### Key Pillars
* **Compute:** Google Cloud Run (Containerized, Scale-to-Zero, multi-region ready).
* **Storage & Database:** Cloud SQL (PostgreSQL with Serverless VPC Connector) + Cloud Storage (Media & Feeds).
* **Storefront:** Next.js 15 App Router, React Server Components (RSC), Progressive Web App (PWA) with offline fallback.
* **Backend:** MedusaJS v2 Headless Commerce Engine (Modular, decoupled, customizable).
* **Marketing & Analytics:** Google Tag Manager (Client + Server-Side), Google Analytics 4, Consent Mode v2, Google Merchant Center automated feeds, Google Ads Enhanced Conversions.
* **Operations:** Google Workspace sync (Sheets, Drive, Gmail via Cloud Tasks).

---

## FinOps: Cost Analysis & Free-Tier Optimization

Unlike traditional e-commerce setups requiring 24/7 provisioned Virtual Machines (Compute Engine) or managed Kubernetes clusters (GKE), this stack uses only pay-per-use, scale-to-zero serverless services.

| Service | Allocation / Tier | Expected Cost (Idle/Low Traffic) | Free Tier Inclusions |
| :--- | :--- | :--- | :--- |
| **Cloud Run (Storefront)** | 512MB RAM, 1 vCPU, `min: 0`, `max: 5` | **$0.00** | 2M requests/mo, 360k vCPU-sec, 180k GB-sec free |
| **Cloud Run (Core API)** | 1GB RAM, 1 vCPU, `min: 0`, `max: 3` | **$0.00** | Covered within aggregate Cloud Run quota |
| **Cloud Run (sGTM)** | 512MB RAM, 1 vCPU, `min: 0`, `max: 2` | **$0.00 - $1.00** | Custom single-instance override (avoids default $40 fee) |
| **Cloud SQL** | PostgreSQL 16, `db-f1-micro` | **~$9.00 - $10.00** | Single shared vCPU, persistent storage |
| **Cloud Storage** | Standard Storage (~10GB - 20GB) | **~$0.20 - $0.50** | 5GB-mo free per project |
| **Firebase Hosting / CDN** | Global Edge Distribution | **$0.00** | 10GB storage, 360MB/day data transfer free |
| **Serverless VPC Access** | Micro instance connector | **~$2.00 - $3.00** | Low-throughput internal network connector |
| **Cloud Tasks & Scheduler**| Async workers & GMC Feed cron | **$0.00** | 1M tasks/mo & 3 cron jobs free |
| **BigQuery + GA4** | Streaming telemetry raw export | **$0.00** | 10GB active storage & 1TB queries/mo free |
| **Total Estimated Base Cost** | | **~$12.00 - $18.00 / month** | |

---

## Project Structure

This project is organized as a monorepo powered by [Turborepo](https://turbo.build/) and [PNPM Workspaces](https://pnpm.io/workspaces):


```

apps/
├── web/                 # Next.js 15 PWA Storefront with i18n & Google Pay
└── backend/             # MedusaJS Core API with custom modules
config/
├── gtm/                 # Pre-configured Web & Server GTM templates
└── workspace/           # Google Apps Script automation templates
infra/
└── terraform/           # GCP Infrastructure as Code modules & environments
packages/
├── types/               # Shared TypeScript domain contracts
└── tsconfig/            # Standardized TypeScript compiler configurations

```

---

## Quickstart (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/) >= 20.x
* [pnpm](https://pnpm.io/) >= 9.x
* [Docker Desktop](https://www.docker.com/)
* [gcloud CLI](https://cloud.google.com/sdk/docs/install) (Optional for local deployment)
* [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.8.x

### 1. Clone & Install
```bash
git clone [https://github.com/your-org/gcp-serverless-commerce.git](https://github.com/your-org/gcp-serverless-commerce.git)
cd gcp-serverless-commerce
pnpm install

```

### 2. Start Local Database

```bash
# Starts local PostgreSQL container
docker compose up -d

```

### 3. Initialize Environment Variables

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env

```

### 4. Run Development Servers

```bash
pnpm dev

```

* **Storefront (Next.js):** `http://localhost:3000`
* **Core API (MedusaJS):** `http://localhost:9000`
* **Admin Dashboard:** `http://localhost:9000/app`

---

## Deployment & Cloud Setup

### 1. Infrastructure as Code (Terraform)

Set up your GCP resources with the modular Terraform templates:

```bash
cd infra/terraform/environments/prod

# Authenticate with Google Cloud
gcloud auth application-default login

# Initialize & apply
terraform init
terraform plan -out=tfplan
terraform apply tfplan

```

### 2. CI/CD via GitHub Actions (Keyless Authentication)

This project uses **GCP Workload Identity Federation**. No long-lived service account keys are stored in GitHub Secrets.

1. Ensure the `workload_identity` Terraform module is applied.
2. Add these repository secrets to GitHub:
* `GCP_WORKLOAD_IDENTITY_PROVIDER`: `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
* `GCP_SERVICE_ACCOUNT`: `github-deployer@<PROJECT_ID>.iam.gserviceaccount.com`



---

## Analytics & Marketing Setup

1. **Server-Side GTM:** Deploy the container in `config/gtm/server-container-template.json` to the Cloud Run sGTM service. Map your custom subdomain (e.g., `ss.yourdomain.com`).
2. **Consent Mode v2:** Embedded in `apps/web/src/app/[locale]/layout.tsx`. Defaults to `denied` for all parameters until user consent is granted via the CMP banner.
3. **Google Merchant Center:** Set up a Scheduled Fetch pointing to the Cloud Storage public XML feed generated automatically by the backend feed service.
4. **Enhanced Conversions:** Configured via sGTM to hash customer data (SHA-256) server-side and forward it directly to the Google Ads API.

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE&utm_source=gemini) file for details.

```

---

### Core Terraform Modular Configuration (`infra/terraform/modules/cloud_run/main.tf`)

```hcl
variable "service_name" { type = string }
variable "project_id" { type = string }
variable "region" { type = string }
variable "image" { type = string }
variable "min_instances" { type = number, default = 0 }
variable "max_instances" { type = number, default = 3 }
variable "memory_limit" { type = string, default = "512Mi" }
variable "cpu_limit" { type = string, default = "1" }
variable "concurrency" { type = number, default = 80 }
variable "vpc_connector_id" { type = string, default = null }
variable "env_vars" { type = map(string), default = {} }
variable "secrets" { type = map(string), default = {} }

resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      resources {
        limits = {
          memory = var.memory_limit
          cpu    = var.cpu_limit
        }
      }

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secrets
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }
    }

    dynamic "vpc_access" {
      for_each = var.vpc_connector_id != null ? [var.vpc_connector_id] : []
      content {
        connector = vpc_access.value
        egress    = "PRIVATE_RANGES_ONLY"
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = google_cloud_run_v2_service.service.project
  location = google_cloud_run_v2_service.service.location
  name     = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_uri" {
  value = google_cloud_run_v2_service.service.uri
}

```

---

### Generic Automated Feed Exporter (`apps/backend/src/modules/google-merchant/feed-generator.ts`)

```typescript
import { Storage } from "@google-cloud/storage";

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  price: string; // e.g. "199.00 USD"
  availability: "in_stock" | "out_of_stock";
  brand: string;
  gtin?: string;
  mpn?: string;
}

export class GoogleMerchantFeedService {
  private storage: Storage;
  private bucketName: string;

  constructor(bucketName: string) {
    this.storage = new Storage();
    this.bucketName = bucketName;
  }

  public generateXmlFeed(items: CatalogItem[]): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Product Feed</title>
<link>https://yourdomain.com</link>
<description>Automated Serverless GMC Product Feed</description>`;

    const xmlItems = items
      .map(
        (item) => `
<item>
  <g:id>${item.id}</g:id>
  <g:title><![CDATA[${item.title}]]></g:title>
  <g:description><![CDATA[${item.description}]]></g:description>
  <g:link>${item.link}</g:link>
  <g:image_link>${item.image_link}</g:image_link>
  <g:price>${item.price}</g:price>
  <g:availability>${item.availability}</g:availability>
  <g:brand><![CDATA[${item.brand}]]></g:brand>
  ${item.gtin ? `<g:gtin>${item.gtin}</g:gtin>` : ""}
  ${item.mpn ? `<g:mpn>${item.mpn}</g:mpn>` : ""}
</item>`
      )
      .join("");

    const xmlFooter = `
</channel>
</rss>`;

    return `${xmlHeader}${xmlItems}${xmlFooter}`;
  }

  public async uploadFeedToGcs(xmlContent: string, fileName = "feed.xml"): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    await file.save(xmlContent, {
      contentType: "application/xml",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=3600"
      }
    });

    return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
  }
}

```

---

### Local Developer Runtime (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: gcp_commerce_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: medusa_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:

---

## ⚡ Serverless Demo Architecture & Placeholder Reference

This repository is pre-configured to run as a **$0.00 idle cost demo project** on Google Cloud Platform (`europe-west3` Frankfurt). All services have graceful sandbox fallbacks when placeholder IDs are used.

### Pre-Configured Placeholder IDs

| Service | Environment Variable | Demo / Placeholder Value | How it Works in Demo Mode |
| :--- | :--- | :--- | :--- |
| **Database** | `DATABASE_URL` | `postgresql://postgres:PLACEHOLDER_DB_PASSWORD@34.141.100.10:5432/apex_ecommerce?sslmode=require` | In-memory & file-backed repository ($0 idle cost, zero database fees) |
| **Stripe** | `STRIPE_SECRET_KEY` | `sk_test_placeholder_51NxXXXXXXXXXXXXXXXXXXXXXXXXXX` | Generates simulated PaymentIntents (`pi_demo_...`) with instant mock capture |
| **Stripe** | `STRIPE_PUBLISHABLE_KEY` | `pk_test_placeholder_51NxXXXXXXXXXXXXXXXXXXXXXXXXXX` | Browser client token for local payment methods |
| **PayPal** | `PAYPAL_CLIENT_ID` | `AeA_placeholder_client_id_for_demo` | Sandbox order creation and instant simulated buyer approval |
| **Google Pay** | `GOOGLE_PAY_MERCHANT_ID` | `BCR2DN4T_PLACEHOLDER_MERCHANT_ID` | Web Payment Request API in `TEST` environment |
| **Email** | `RESEND_API_KEY` | `re_placeholder_xxxxxxxxxxxxxxxxxxxxxxxx` | Logs SPF/DKIM compliant emails to in-memory outbox (`/api/tasks/email-outbox`) |
| **Email** | `SENDGRID_API_KEY` | `SG.placeholder_xxxxxxxxxxxxxxxxxxxxxxxx` | Fallback transactional provider simulation |
| **Translate** | `GOOGLE_TRANSLATE_API_KEY` | `AIzaSy_PLACEHOLDER_TRANSLATE_API_KEY` | High-fidelity translation engine for DE, FR, IT, ES, NL inquiries |
| **sGTM** | `CONTAINER_CONFIG` | `aWQ9R1RNLVhYWFhYWA==` (`id=GTM-XXXXXX`) | Cloud Run server-side tagging container proxying to `ss.apexstore.eu` |
| **EU OSS** | `EU_OSS_VAT_ID` | `DE345678901` | Calculates EU VAT (DE 19%, IT 22%, FR 20%) and generates printable invoices |

### Switching to Live Production
To go live with real credit card processing and real transactional emails:
1. Update secrets in **Google Cloud Secret Manager** (`gcloud secrets versions add ...`).
2. Update `backend-env.prod.yaml` with your live Cloud SQL instance socket or database URL.
3. Replace `STRIPE_SECRET_KEY` with your live Stripe key (`sk_live_...`).
4. Replace `PAYPAL_CLIENT_ID` and set `PAYPAL_MODE=live`.
5. Point your domain registrar to Google Cloud DNS name servers (`apexstore.eu`).

---

## 🛡️ DevSecOps & Security Automation Pipeline

The repository integrates a comprehensive, enterprise-grade, **100% free and open-source DevSecOps pipeline** running automatically on every push, pull request, and weekly schedule via GitHub Actions:

| Security Domain | Tool | Scope & Purpose | Output & Artifacts |
| :--- | :--- | :--- | :--- |
| **Secret Scanning** | **Gitleaks** | Prevents accidental leak of private keys, tokens, or credentials across git history with custom `.gitleaks.toml` allowlist | `gitleaks-results.sarif` |
| **SAST (Static Analysis)** | **Semgrep** | Fast semantic AST scanning for OWASP Top 10, JavaScript, TypeScript, React, and security audits | `semgrep.sarif` uploaded to Security Tab |
| **SAST (Deep Taint)** | **GitHub CodeQL** | Deep data flow analysis and query suites (`security-extended`, `security-and-quality`) | GitHub Code Scanning alerts |
| **SCA (Dependencies)** | **Aqua Trivy** | Scans lockfiles and filesystem for high and critical CVE vulnerabilities | `trivy-results.sarif` |
| **SBOM (Bill of Materials)** | **Aqua Trivy** | Generates standard CycloneDX and SPDX SBOMs for EU Cyber Resilience Act & CISA compliance | `sbom-cyclonedx.json`, `sbom-spdx.json` |
| **DAST (Dynamic Analysis)** | **OWASP ZAP** | Dynamic application security baseline and API scan against live Staging Cloud Run services | `zap-storefront-scan-report`, `zap-api-scan-report` |

### Triggering Security Pipelines Manually
```bash
# Trigger DevSecOps Pipeline
gh workflow run "DevSecOps Pipeline" --ref main

# Trigger OWASP ZAP DAST Scan against Staging
gh workflow run "DAST Security Pipeline (OWASP ZAP)" --ref staging
```