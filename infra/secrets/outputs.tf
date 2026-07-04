output "secret_ids" {
  description = "Map of logical secret name to Secret Manager secret_id"
  value       = { for k, s in google_secret_manager_secret.this : k => s.secret_id }
}
