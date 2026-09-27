resource "google_compute_network" "vpc_network" {
  name                    = var.network_name
  project                 = var.project_id
  auto_create_subnetworks = true
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-for-db"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_vpc_access_connector" "connector" {
  name          = var.connector_name
  project       = var.project_id
  region        = var.region
  ip_cidr_range = var.connector_cidr_range
  network       = google_compute_network.vpc_network.name
  min_instances = 2
  max_instances = 3
  machine_type  = "f1-micro"
}
