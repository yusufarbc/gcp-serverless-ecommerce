variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "gcp-serverless-ecommerce"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "europe-west3"
}

variable "domain_name" {
  type        = string
  description = "Apex root domain name for European operations"
  default     = "apexstore.eu" # Placeholder domain
}

variable "storefront_prod_service_name" {
  type        = string
  description = "Production Storefront Cloud Run Service Name"
  default     = "commerce-storefront-pwa"
}

variable "storefront_staging_service_name" {
  type        = string
  description = "Staging Storefront Cloud Run Service Name"
  default     = "commerce-storefront-pwa-staging"
}

variable "backend_prod_service_name" {
  type        = string
  description = "Production Backend Cloud Run Service Name"
  default     = "commerce-core-api"
}

variable "sgtm_service_name" {
  type        = string
  description = "sGTM Cloud Run Service Name"
  default     = "commerce-sgtm-prod"
}
