output "firestore_database_name" {
  description = "Firestore database name"
  value       = google_firestore_database.default.name
}

output "firestore_database_id" {
  description = "Firestore database resource ID"
  value       = google_firestore_database.default.id
}

output "firestore_location" {
  description = "Firestore database location"
  value       = google_firestore_database.default.location_id
}

output "firestore_type" {
  description = "Firestore database type"
  value       = google_firestore_database.default.type
}

output "firestore_ttl_field" {
  description = "Timestamp field configured for automatic document deletion"
  value       = local.firestore_ttl_field
}

output "firestore_ttl_collections" {
  description = "Collections with TTL enabled on expiresAt"
  value       = sort(tolist(local.firestore_ttl_collections))
}

output "document_ttl_days" {
  description = "Document retention period in days; writers must set expiresAt to creation time plus this duration"
  value       = local.document_ttl_days
}
