locals {
  region                      = "us-central1"
  firestore_location          = "us-central1"
  firestore_database_type     = "FIRESTORE_NATIVE"
  firestore_delete_protection = "DELETE_PROTECTION_ENABLED"
  firestore_ttl_collections   = toset(["articles"])
  firestore_ttl_field         = "expiresAt"
  document_ttl_days           = 7
}

resource "google_project_service" "firestore" {
  project            = var.project_id
  service            = "firestore.googleapis.com"
  disable_on_destroy = false
}

resource "google_firestore_database" "default" {
  project                           = var.project_id
  name                              = "(default)"
  location_id                       = local.firestore_location
  type                              = local.firestore_database_type
  delete_protection_state           = local.firestore_delete_protection
  deletion_policy                   = "ABANDON"
  point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_DISABLED"

  depends_on = [google_project_service.firestore]
}

resource "google_firestore_field" "expires_at_ttl" {
  for_each = local.firestore_ttl_collections

  project    = var.project_id
  database   = google_firestore_database.default.name
  collection = each.value
  field      = local.firestore_ttl_field

  ttl_config {}

  depends_on = [google_firestore_database.default]
}
