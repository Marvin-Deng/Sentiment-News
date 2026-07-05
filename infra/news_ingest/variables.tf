variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "image" {
  description = "Container image to run (e.g. us-central1-docker.pkg.dev/PROJECT/REPO/news-ingest:TAG)"
  type        = string
}

variable "schedule" {
  description = "Cron schedule (in the scheduler's time zone) on which to trigger the ingestion job"
  type        = string
  default     = "0 13 * * MON-FRI"
}

variable "time_zone" {
  description = "Time zone for the Cloud Scheduler cron schedule"
  type        = string
  default     = "America/New_York"
}
