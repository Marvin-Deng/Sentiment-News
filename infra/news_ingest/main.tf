locals {
  region           = "us-central1"
  job_name         = "news-ingest"
  artifact_repo_id = "news-ingest"
  scheduler_job_id = "news-ingest-trigger"

  finnhub_key_secret_id    = "finnhub-key"
  tiingo_api_key_secret_id = "tiingo-api-key"
  gemini_key_secret_id     = "gemini-key"
}

data "google_project" "current" {
  project_id = var.project_id
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

resource "google_project_service" "cloud_scheduler" {
  project            = var.project_id
  service            = "cloudscheduler.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam" {
  project            = var.project_id
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "news_ingest" {
  project       = var.project_id
  location      = local.region
  repository_id = local.artifact_repo_id
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry]
}

resource "google_cloud_run_v2_job" "news_ingest" {
  project  = var.project_id
  name     = local.job_name
  location = local.region

  template {
    template {
      max_retries = 1
      timeout     = "900s"

      containers {
        image = var.image

        env {
          name = "FINNHUB_API_KEY"
          value_source {
            secret_key_ref {
              secret  = local.finnhub_key_secret_id
              version = "latest"
            }
          }
        }

        env {
          name = "TIINGO_TOKEN"
          value_source {
            secret_key_ref {
              secret  = local.tiingo_api_key_secret_id
              version = "latest"
            }
          }
        }

        env {
          name = "GEMINI_KEY"
          value_source {
            secret_key_ref {
              secret  = local.gemini_key_secret_id
              version = "latest"
            }
          }
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
      }
    }
  }

  depends_on = [google_project_service.run]
}

resource "google_service_account" "scheduler_invoker" {
  project      = var.project_id
  account_id   = "news-ingest-scheduler"
  display_name = "Invokes the news-ingest Cloud Run Job on a schedule"

  depends_on = [google_project_service.iam]
}

resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_job.news_ingest.location
  name     = google_cloud_run_v2_job.news_ingest.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.scheduler_invoker.email}"
}

resource "google_cloud_scheduler_job" "news_ingest_trigger" {
  project   = var.project_id
  region    = local.region
  name      = local.scheduler_job_id
  schedule  = var.schedule
  time_zone = var.time_zone

  http_target {
    uri         = "https://${local.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/${google_cloud_run_v2_job.news_ingest.name}:run"
    http_method = "POST"

    oauth_token {
      service_account_email = google_service_account.scheduler_invoker.email
    }
  }

  depends_on = [google_project_service.cloud_scheduler]
}
