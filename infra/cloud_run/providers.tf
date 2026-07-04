terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  backend "gcs" {
    prefix = "cloud_run"
  }
}

provider "google" {
  project = var.project_id
  region  = local.region
}
