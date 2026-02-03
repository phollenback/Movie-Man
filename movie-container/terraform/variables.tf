variable "resource_group_name" {
  type        = string
  default     = "movie-man-container-rg"
  description = "Resource group name"
}

variable "location" {
  type        = string
  default     = "westus2"
  description = "Azure region"
}

variable "project_name" {
  type        = string
  default     = "moviemanc"
  description = "Project name prefix for resources (unique from movie-app)"
}

variable "entra_client_id" {
  type        = string
  description = "Entra (Azure AD) app client ID for auth"
}

variable "entra_tenant_id" {
  type        = string
  default     = "common"
  description = "Entra tenant ID"
}

variable "log_retention_days" {
  type        = number
  default     = 30
  description = "Log Analytics retention in days (cost: lower = cheaper)"
}

variable "frontend_fqdn" {
  type        = string
  default     = "https://moviemanc.calmforest-70405e10.westus2.azurecontainerapps.io"
  description = "Frontend Container App FQDN for CORS (must match your deployment)"
}
