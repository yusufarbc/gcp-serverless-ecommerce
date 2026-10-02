variable "project_id" {
  type    = string
  default = "gcp-serverless-ecommerce"
}

variable "region" {
  type    = string
  default = "europe-west3"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "domain_name" {
  type    = string
  default = "staging.apexstore.eu"
}

variable "sgtm_container_config" {
  type    = string
  default = "GTM-STAGING"
}

variable "backend_image_tag" {
  type        = string
  description = "Immutable container image tag (e.g. git commit SHA or release tag) for backend Cloud Run"
  default     = "staging"
}

variable "storefront_image_tag" {
  type        = string
  description = "Immutable container image tag (e.g. git commit SHA or release tag) for storefront Cloud Run"
  default     = "staging"
}
