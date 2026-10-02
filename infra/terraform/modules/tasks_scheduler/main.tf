resource "google_cloud_tasks_queue" "ecommerce_queue" {
  name     = var.queue_name
  location = var.region
  project  = var.project_id

  rate_limits {
    max_concurrent_dispatches = 10
    max_dispatches_per_second = 50.0
  }

  retry_config {
    max_attempts  = 5
    min_backoff   = "0.5s"
    max_backoff   = "300s"
    max_doublings = 5
  }
}

# Nightly 03:00 GMC Product Feed Generator cron
resource "google_cloud_scheduler_job" "nightly_gmc_feed" {
  name             = "nightly-gmc-feed-generator"
  project          = var.project_id
  region           = var.region
  schedule         = "0 3 * * *"
  time_zone        = "Europe/Berlin"
  attempt_deadline = "300s"

  http_target {
    http_method = "POST"
    uri         = "${var.backend_service_url}/api/gmc/generate"

    headers = {
      "Content-Type" = "application/json"
    }
  }
}

output "queue_id" {
  value = google_cloud_tasks_queue.ecommerce_queue.id
}
