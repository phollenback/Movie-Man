variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "project_name" {
  type = string
}

variable "acr_login_server" {
  type = string
}

variable "acr_admin_username" {
  type = string
}

variable "acr_admin_password" {
  type      = string
  sensitive = true
}

variable "storage_account_name" {
  type = string
}

variable "storage_connection_string" {
  type      = string
  sensitive = true
}

variable "app_insights_connection_string" {
  type      = string
  sensitive = true
}

variable "log_analytics_workspace_id" {
  type = string
}

variable "entra_client_id" {
  type = string
}

variable "entra_tenant_id" {
  type = string
}

variable "cors_allowed_origins" {
  type        = list(string)
  description = "CORS allowed origins for Function app (include your web app URL)"
  default     = ["https://movieman.azurewebsites.net", "http://localhost:3000", "http://localhost:8080"]
}
