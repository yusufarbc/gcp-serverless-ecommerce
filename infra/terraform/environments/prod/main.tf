terraform {
  required_version = ">= 1.8.0"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.30" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "artifact_registry" {
  source     = "../../modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
}

module "networking" {
  source       = "../../modules/networking"
  project_id   = var.project_id
  region       = var.region
  network_name = "ecommerce-vpc-prod"
}

module "cloud_sql" {
  source                 = "../../modules/cloud_sql"
  project_id             = var.project_id
  region                 = var.region
  instance_name          = "ecommerce-pg-prod"
  network_id             = module.networking.network_id
  private_vpc_connection = module.networking.private_vpc_connection
}

module "cloud_storage" {
  source      = "../../modules/cloud_storage"
  project_id  = var.project_id
  region      = var.region
  bucket_name = "${var.project_id}-media-prod"
}

module "secret_manager" {
  source       = "../../modules/secret_manager"
  project_id   = var.project_id
  secret_names = ["DATABASE_URL", "JWT_SECRET", "STRIPE_SECRET_KEY"]
}

module "backend_run" {
  source           = "../../modules/cloud_run"
  service_name     = "commerce-core-api"
  project_id       = var.project_id
  region           = var.region
  image            = "${module.artifact_registry.repository_url}/medusa-backend:latest"
  min_instances    = 0
  max_instances    = 3
  memory_limit     = "1Gi"
  cpu_limit        = "1"
  concurrency      = 40
  vpc_connector_id = module.networking.vpc_connector_id
  env_vars = {
    "NODE_ENV"       = "production"
    "PORT"           = "9000"
    "GCP_PROJECT_ID" = var.project_id
    "GCP_REGION"     = var.region
  }
  secrets = {
    "DATABASE_URL" = "DATABASE_URL"
    "JWT_SECRET"   = "JWT_SECRET"
  }
}

module "storefront_run" {
  source        = "../../modules/cloud_run"
  service_name  = "commerce-storefront-pwa"
  project_id    = var.project_id
  region        = var.region
  image         = "${module.artifact_registry.repository_url}/nextjs-storefront:latest"
  min_instances = 0
  max_instances = 5
  memory_limit  = "512Mi"
  cpu_limit     = "1"
  concurrency   = 80
  env_vars = {
    "NODE_ENV" = "production"
    "PORT"     = "3000"
  }
}

module "sgtm_run" {
  source        = "../../modules/cloud_run"
  service_name  = "commerce-sgtm"
  project_id    = var.project_id
  region        = var.region
  image         = "gcr.io/cloud-tagging-102307/gtm-cloud-image:latest"
  min_instances = 0
  max_instances = 2
  memory_limit  = "512Mi"
  env_vars = {
    "CONTAINER_CONFIG" = var.sgtm_container_config
    "PORT"             = "8080"
  }
}

module "tasks_scheduler" {
  source              = "../../modules/tasks_scheduler"
  project_id          = var.project_id
  region              = var.region
  queue_name          = "ecommerce-tasks"
  backend_service_url = module.backend_run.service_uri
}
