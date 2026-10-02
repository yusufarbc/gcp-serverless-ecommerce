# Server-Side Google Tag Manager (sGTM) on Cloud Run

## Overview
This directory contains the deployment configuration for the **Server-Side Google Tag Manager (sGTM)** container running on Google Cloud Run in `europe-west3` (Frankfurt).

### Core Benefits for EU Cross-Border Commerce:
1. **GDPR & ePrivacy Compliance:** PII (IP addresses, user agents) is sanitized server-side before reaching ad networks.
2. **First-Party Cookie Lifetime:** Operates under your own custom domain (`ss.apexstore.eu`), bypassing Safari ITP and browser ad-blockers.
3. **Meta Conversions API (CAPI) & GA4:** Unified dual-tagging for higher attribution accuracy on European ad spend.
4. **Zero Idle Cost:** Runs as a serverless container on Cloud Run with `min-instances: 0` for development/staging and auto-scales on traffic.

---

## Configuration & Placeholder Parameters

| Environment Variable | Description | Demo / Placeholder Value | Production Value |
| :--- | :--- | :--- | :--- |
| `CONTAINER_CONFIG` | Base64-encoded Container Config string from GTM | `aWQ9R1RNLVhYWFhYWA==` (represents `id=GTM-XXXXXX`) | Base64 string from GTM Admin > Container Settings |
| `PREVIEW_SERVER_URL` | Dedicated preview URL for GTM debug mode | `https://ss-staging.apexstore.eu` | `https://ss.apexstore.eu` |
| `RUN_AS_PREVIEW_SERVER` | Set `true` if deploying a dedicated debug instance | `false` | `false` |
| `PORT` | Container HTTP port | `8080` | `8080` |

---

## Deployment via Cloud Run

```bash
# Deploy to Google Cloud Run in Frankfurt (europe-west3)
gcloud run deploy commerce-sgtm-prod \
  --image=gcr.io/cloud-tagging-102307/gtm-cloud-image:stable \
  --region=europe-west3 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars=CONTAINER_CONFIG="aWQ9R1RNLVhYWFhYWA==",RUN_AS_PREVIEW_SERVER="false"
```
