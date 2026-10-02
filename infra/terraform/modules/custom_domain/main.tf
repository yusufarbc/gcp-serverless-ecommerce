resource "google_dns_managed_zone" "primary_zone" {
  name        = replace(var.domain_name, ".", "-")
  dns_name    = "${var.domain_name}."
  description = "Managed DNS Zone for European D2C Serverless Commerce"
  visibility  = "public"
}

# Production Storefront Domain Mapping
resource "google_cloud_run_domain_mapping" "storefront_prod" {
  location = var.region
  name     = var.domain_name

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = var.storefront_prod_service_name
  }
}

# Staging Storefront Subdomain Mapping
resource "google_cloud_run_domain_mapping" "storefront_staging" {
  location = var.region
  name     = "staging.${var.domain_name}"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = var.storefront_staging_service_name
  }
}

# Core API Subdomain Mapping
resource "google_cloud_run_domain_mapping" "api_prod" {
  location = var.region
  name     = "api.${var.domain_name}"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = var.backend_prod_service_name
  }
}

# sGTM Server-Side Tagging Subdomain Mapping
resource "google_cloud_run_domain_mapping" "sgtm_prod" {
  location = var.region
  name     = "ss.${var.domain_name}"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = var.sgtm_service_name
  }
}

# SPF TXT Record for Authorized Transactional Email Dispatch (Resend, SendGrid, Google)
resource "google_dns_record_set" "spf_record" {
  name         = google_dns_managed_zone.primary_zone.dns_name
  managed_zone = google_dns_managed_zone.primary_zone.name
  type         = "TXT"
  ttl          = 300

  rrdatas = [
    "\"v=spf1 include:_spf.google.com include:sendgrid.net include:resend.com ~all\""
  ]
}

# DMARC Policy TXT Record (p=quarantine for European deliverability standards)
resource "google_dns_record_set" "dmarc_record" {
  name         = "_dmarc.${google_dns_managed_zone.primary_zone.dns_name}"
  managed_zone = google_dns_managed_zone.primary_zone.name
  type         = "TXT"
  ttl          = 300

  rrdatas = [
    "\"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${var.domain_name}; ruf=mailto:dmarc-forensics@${var.domain_name}; sp=quarantine; adkim=r; aspf=r\""
  ]
}

# DKIM Selector Placeholder TXT Record
resource "google_dns_record_set" "dkim_record" {
  name         = "resend._domainkey.${google_dns_managed_zone.primary_zone.dns_name}"
  managed_zone = google_dns_managed_zone.primary_zone.name
  type         = "TXT"
  ttl          = 300

  rrdatas = [
    "\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3placeholderDKIMkeyForDemoPurposeOnlyIDAQAB\""
  ]
}
