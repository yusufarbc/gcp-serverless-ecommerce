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
  default = "prod"
}

variable "domain_name" {
  type    = string
  default = "apexstore.eu"
}

variable "sgtm_container_config" {
  type    = string
  default = "GTM-PROD"
}

variable "backend_image_tag" {
  type        = string
  description = "Immutable container image tag (e.g. git commit SHA or release tag) for backend Cloud Run"
  default     = "latest"
}

variable "storefront_image_tag" {
  type        = string
  description = "Immutable container image tag (e.g. git commit SHA or release tag) for storefront Cloud Run"
  default     = "latest"
}
