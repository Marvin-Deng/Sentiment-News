variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "image" {
  description = "Container image to deploy (e.g. us-central1-docker.pkg.dev/PROJECT/REPO/client:TAG)"
  type        = string
}

variable "app_url" {
  description = "Public base URL of the deployed Cloud Run service, used for the app's own server-side API calls"
  type        = string
  default     = "http://localhost:3000"
}
