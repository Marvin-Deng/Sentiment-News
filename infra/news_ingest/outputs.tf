output "job_name" {
  description = "Name of the Cloud Run Job"
  value       = google_cloud_run_v2_job.news_ingest.name
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for the news-ingest image"
  value       = google_artifact_registry_repository.news_ingest.repository_id
}

output "scheduler_job_id" {
  description = "Cloud Scheduler job that triggers the news-ingest Cloud Run Job"
  value       = google_cloud_scheduler_job.news_ingest_trigger.name
}

output "scheduler_service_account_email" {
  description = "Service account used by Cloud Scheduler to invoke the job"
  value       = google_service_account.scheduler_invoker.email
}
