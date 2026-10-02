variable "service_name" {
  type        = string
  description = "Cloud Run service name for sGTM"
  default     = "commerce-sgtm"
}

variable "region" {
  type        = string
  description = "GCP Region (europe-west3 Frankfurt)"
  default     = "europe-west3"
}

variable "container_config" {
  type        = string
  description = "Base64-encoded Container Config string from Google Tag Manager"
  default     = "aWQ9R1RNLVhYWFhYWA==" # Placeholder for id=GTM-XXXXXX
}

variable "run_as_preview" {
  type        = bool
  description = "Whether to run this instance as a preview server"
  default     = false
}

variable "preview_server_url" {
  type        = string
  description = "URL of the preview server"
  default     = "https://ss-staging.apexstore.eu"
}

variable "min_instances" {
  type        = number
  description = "Minimum instances (0 for $0 idle cost demo)"
  default     = 0
}

variable "max_instances" {
  type        = number
  description = "Maximum autoscaling instances"
  default     = 5
}
