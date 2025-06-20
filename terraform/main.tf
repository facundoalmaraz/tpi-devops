terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "docker" {}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Servicio de cuenta para la VM


# Permiso de IAM
resource "google_project_iam_member" "sa_compute" {
  project = var.project_id
  role    = "roles/compute.admin"
  member  = "serviceAccount:terraform-devops@advance-verve-459804-e1.iam.gserviceaccount.com"

}


# VM en GCP con Docker y docker-compose instalados
resource "google_compute_instance" "devops_vm" {
  name         = "devops-vm"
  machine_type = "e2-medium"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network       = "default"
    access_config {}
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose git
    usermod -aG docker ${var.vm_user}
    git clone https://github.com/facundoalmaraz/tpi-devops.git /home/${var.vm_user}/app
    cd /home/${var.vm_user}/app
    docker-compose up -d
  EOF

  tags = ["devops"]

service_account {
  email  = "terraform-devops@advance-verve-459804-e1.iam.gserviceaccount.com"
  scopes = ["https://www.googleapis.com/auth/cloud-platform"]
}

}
