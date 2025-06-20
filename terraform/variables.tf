# variables.tf
variable "project_id" {}
variable "region" {
  default = "us-central1"
}
variable "zone" {
  default = "us-central1-a"
}
variable "vm_user" {
  default = "facundo" # el usuario que va a correr los comandos dentro de la VM
}
