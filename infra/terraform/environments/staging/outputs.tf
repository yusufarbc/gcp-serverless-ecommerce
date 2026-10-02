output "storefront_uri" {
  value       = module.storefront_run.service_uri
  description = "Staging Storefront Cloud Run URL"
}

output "core_api_uri" {
  value       = module.backend_run.service_uri
  description = "Staging Core API Cloud Run URL"
}

output "media_bucket_url" {
  value       = module.cloud_storage.bucket_url
  description = "Staging Cloud Storage media bucket URL"
}
