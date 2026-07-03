output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.client.uri
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for the client image"
  value       = google_artifact_registry_repository.client.repository_id
}
