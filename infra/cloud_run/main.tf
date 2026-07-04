locals {
  region           = "us-central1"
  service_name     = "client"
  artifact_repo_id = "client"

  finnhub_key_secret_id    = "finnhub-key"
  tiingo_api_key_secret_id = "tiingo-api-key"
}

resource "google_project_service" "run" {
  project            = var.project_id
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "client" {
  project       = var.project_id
  location      = local.region
  repository_id = local.artifact_repo_id
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry]
}

resource "google_cloud_run_v2_service" "client" {
  project  = var.project_id
  name     = local.service_name
  location = local.region

  template {
    containers {
      image = var.image

      ports {
        container_port = 8080
      }

      env {
        name  = "NEXT_PUBLIC_APP_URL"
        value = var.app_url
      }

      env {
        name = "FINNHUB_KEY"
        value_source {
          secret_key_ref {
            secret  = local.finnhub_key_secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "TIINGO_API_KEY"
        value_source {
          secret_key_ref {
            secret  = local.tiingo_api_key_secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [google_project_service.run]
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = var.project_id
  location = google_cloud_run_v2_service.client.location
  name     = google_cloud_run_v2_service.client.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
