output "storefront_uri" {
  value = module.storefront_run.service_uri
}

output "core_api_uri" {
  value = module.backend_run.service_uri
}

output "sgtm_uri" {
  value = module.sgtm_run.service_uri
}

output "media_bucket_url" {
  value = module.cloud_storage.bucket_url
}
