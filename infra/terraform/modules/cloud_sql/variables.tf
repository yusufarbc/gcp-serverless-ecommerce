variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-west3"
}

variable "instance_name" {
  type    = string
  default = "ecommerce-db"
}

variable "tier" {
  type    = string
  default = "db-f1-micro"
}

variable "database_name" {
  type    = string
  default = "medusa"
}

variable "database_user" {
  type    = string
  default = "medusa_user"
}

variable "network_id" {
  type = string
}

variable "private_vpc_connection" {
  type = any
}
