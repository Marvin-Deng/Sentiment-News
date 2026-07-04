variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "secrets" {
  description = "Values for app secrets (finnhub_key, tiingo_api_key), sourced from CI secrets"
  type        = map(string)
  sensitive   = true
}

variable "accessor_service_accounts" {
  description = "Service account emails that should be granted secretAccessor on every secret (e.g. Cloud Run runtime service accounts)"
  type        = list(string)
  default     = []
}
