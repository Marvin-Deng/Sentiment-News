terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  backend "gcs" {
    prefix = "news_ingest"
  }
}

provider "google" {
  project = var.project_id
  region  = local.region
}
