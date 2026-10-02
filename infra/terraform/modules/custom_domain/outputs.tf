output "dns_name_servers" {
  value       = google_dns_managed_zone.primary_zone.name_servers
  description = "Name servers to configure at your domain registrar (e.g. Google Domains, Cloudflare, Namecheap)"
}

output "production_storefront_url" {
  value       = "https://${var.domain_name}"
  description = "Production Storefront custom domain URL"
}

output "staging_storefront_url" {
  value       = "https://staging.${var.domain_name}"
  description = "Staging Storefront custom domain URL"
}

output "production_api_url" {
  value       = "https://api.${var.domain_name}"
  description = "Production Backend API custom domain URL"
}

output "sgtm_url" {
  value       = "https://ss.${var.domain_name}"
  description = "Server-Side Tagging custom domain URL"
}
