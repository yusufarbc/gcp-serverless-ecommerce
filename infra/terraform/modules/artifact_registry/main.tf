resource "google_artifact_registry_repository" "repo" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker container images for serverless ecommerce apps"
  format        = "DOCKER"
}

output "repository_id" {
  value = google_artifact_registry_repository.repo.repository_id
}

output "repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}
