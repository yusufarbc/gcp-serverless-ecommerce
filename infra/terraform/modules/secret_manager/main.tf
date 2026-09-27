resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(var.secret_names)
  secret_id = each.value
  project   = var.project_id
  replication { auto {} }
}
output "secret_ids" { value = { for k, v in google_secret_manager_secret.secrets : k => v.id } }
