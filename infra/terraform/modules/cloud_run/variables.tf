variable "service_name" {
  type = string
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-west3"
}

variable "image" {
  type = string
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 3
}

variable "memory_limit" {
  type    = string
  default = "512Mi"
}

variable "cpu_limit" {
  type    = string
  default = "1"
}

variable "concurrency" {
  type    = number
  default = 80
}

variable "vpc_connector_id" {
  type    = string
  default = null
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "secrets" {
  type    = map(string)
  default = {}
}
