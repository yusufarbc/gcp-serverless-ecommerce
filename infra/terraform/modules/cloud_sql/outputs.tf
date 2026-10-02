output "instance_name" {
  value = google_sql_database_instance.instance.name
}

output "private_ip_address" {
  value = google_sql_database_instance.instance.private_ip_address
}

output "database_url" {
  value     = "postgresql://${google_sql_user.user.name}:${random_password.db_password.result}@${google_sql_database_instance.instance.private_ip_address}:5432/${var.database_name}"
  sensitive = true
}
