resource "google_cloud_run_v2_service" "sgtm" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = "gcr.io/cloud-tagging-102307/gtm-cloud-image:stable"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "CONTAINER_CONFIG"
        value = var.container_config
      }

      env {
        name  = "RUN_AS_PREVIEW_SERVER"
        value = var.run_as_preview ? "true" : "false"
      }

      env {
        name  = "PREVIEW_SERVER_URL"
        value = var.preview_server_url
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.sgtm.location
  service  = google_cloud_run_v2_service.sgtm.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value       = google_cloud_run_v2_service.sgtm.uri
  description = "The URL of the deployed sGTM Cloud Run service"
}
