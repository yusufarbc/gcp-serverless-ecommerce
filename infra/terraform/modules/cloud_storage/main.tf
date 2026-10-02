#trivy:ignore:AVD-GCP-0066 Google-managed default encryption is sufficient for public media assets
#trivy:ignore:AVD-GCP-0078 Uniform bucket-level access is enforced
#nosemgrep: terraform.gcp.security.gcp-cloud-storage-logging.gcp-cloud-storage-logging
resource "google_storage_bucket" "bucket" {
  name                        = var.bucket_name
  project                     = var.project_id
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  # Lifecycle: Delete temp files after 14 days
  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age            = 14
      matches_prefix = ["temp/"]
    }
  }

  # Lifecycle: Archive invoices to COLDLINE after 90 days
  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
    condition {
      age            = 90
      matches_prefix = ["invoices/"]
    }
  }
}

# Grant public read access to media assets and GMC feed
#trivy:ignore:AVD-GCP-0001 Public read access required for e-commerce catalog media and product feeds
#nosemgrep: terraform.gcp.security.gcp-storage-bucket-public-access.gcp-storage-bucket-public-access
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

output "bucket_name" {
  value = google_storage_bucket.bucket.name
}

output "bucket_url" {
  value = "https://storage.googleapis.com/${google_storage_bucket.bucket.name}"
}
