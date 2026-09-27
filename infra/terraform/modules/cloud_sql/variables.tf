variable "project_id" { type = string }
variable "region" { type = string, default = "europe-west3" }
variable "instance_name" { type = string, default = "ecommerce-db" }
variable "tier" { type = string, default = "db-f1-micro" }
variable "network_id" { type = string }
variable "private_vpc_connection" { type = any }
