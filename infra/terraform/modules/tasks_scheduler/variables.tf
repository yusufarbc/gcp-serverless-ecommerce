variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "europe-west3"
}

variable "queue_name" {
  type        = string
  description = "Cloud Tasks queue name"
}

variable "backend_service_url" {
  type        = string
  description = "Backend service URL for Cloud Scheduler HTTP targets"
}
