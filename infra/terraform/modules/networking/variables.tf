variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "europe-west3"
}

variable "network_name" {
  type        = string
  description = "VPC Network name"
  default     = "ecommerce-vpc"
}

variable "connector_name" {
  type        = string
  description = "Serverless VPC connector name"
  default     = "vpc-connector"
}

variable "connector_cidr_range" {
  type        = string
  description = "/28 IP range for Serverless VPC connector"
  default     = "10.8.0.0/28"
}
