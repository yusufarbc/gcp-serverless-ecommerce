variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
  default     = "europe-west3"
}

variable "repository_id" {
  type        = string
  description = "Repository name in Artifact Registry"
  default     = "apps"
}
