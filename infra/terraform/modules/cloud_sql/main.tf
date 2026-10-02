resource "random_password" "db_password" {
  length  = 24
  special = false
}

resource "google_sql_database_instance" "instance" {
  name                = var.instance_name
  project             = var.project_id
  region              = var.region
  database_version    = "POSTGRES_16"
  deletion_protection = false # Set to true in strict production

  settings {
    tier              = var.tier
    disk_size         = 10
    disk_type         = "PD_SSD"
    disk_autoresize   = false
    availability_type = "ZONAL" # Single zone to minimize costs

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
  }

  depends_on = [var.private_vpc_connection]
}

resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.instance.name
  project  = var.project_id
}

resource "google_sql_user" "user" {
  name     = var.database_user
  instance = google_sql_database_instance.instance.name
  password = random_password.db_password.result
  project  = var.project_id
}
