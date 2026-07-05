locals {
  region = "us-central1"

  secrets = {
    finnhub_key    = "finnhub-key"
    tiingo_api_key = "tiingo-api-key"
    gemini_key     = "gemini-key"
  }

  # The Cloud Run default runtime service account, granted access by default since
  # infra/cloud_run (and future services like the news ingestion job) run as it
  # unless a dedicated service account is configured.
  default_accessor_service_accounts = [
    "${data.google_project.current.number}-compute@developer.gserviceaccount.com",
  ]

  accessor_service_accounts = distinct(concat(
    local.default_accessor_service_accounts,
    var.accessor_service_accounts,
  ))

  accessor_pairs = flatten([
    for secret_key, secret_id in local.secrets : [
      for sa in local.accessor_service_accounts : {
        secret_key = secret_key
        sa         = sa
      }
    ]
  ])
}

data "google_project" "current" {
  project_id = var.project_id
}

resource "google_project_service" "secret_manager" {
  project            = var.project_id
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_secret_manager_secret" "this" {
  for_each  = local.secrets
  project   = var.project_id
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.secret_manager]
}

resource "google_secret_manager_secret_version" "this" {
  for_each    = local.secrets
  secret      = google_secret_manager_secret.this[each.key].id
  secret_data = var.secrets[each.key]
}

resource "google_secret_manager_secret_iam_member" "accessor" {
  for_each = {
    for pair in local.accessor_pairs : "${pair.secret_key}/${pair.sa}" => pair
  }
  project   = var.project_id
  secret_id = google_secret_manager_secret.this[each.value.secret_key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${each.value.sa}"
}
