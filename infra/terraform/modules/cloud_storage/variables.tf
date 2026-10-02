variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "europe-west3"
}

variable "bucket_name" {
  type        = string
  description = "Name of the GCS Bucket"
}
