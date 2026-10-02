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
