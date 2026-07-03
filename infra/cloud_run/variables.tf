variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "image" {
  description = "Container image to deploy (e.g. us-central1-docker.pkg.dev/PROJECT/REPO/client:TAG)"
  type        = string
}
