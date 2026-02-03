# App Service Plan for Web App (B1 = cost-effective)
resource "azurerm_service_plan" "webapp" {
  name                = "${var.project_name}-plan"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# Web App (Container)
resource "azurerm_linux_web_app" "webapp" {
  name                = var.project_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.webapp.id

  site_config {
    always_on = true
    application_stack {
      docker_image     = "${var.acr_login_server}/movie-man-front:latest"
      docker_image_tag = "latest"
    }
  }

  app_settings = {
    WEBSITES_PORT                    = "80"
    DOCKER_REGISTRY_SERVER_URL       = "https://${var.acr_login_server}"
    DOCKER_REGISTRY_SERVER_USERNAME  = var.acr_admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD  = var.acr_admin_password
    APPLICATIONINSIGHTS_CONNECTION_STRING = var.app_insights_connection_string
    ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
  }

  identity {
    type = "SystemAssigned"
  }
}

# Function App - B1 (Y1 Consumption Linux not available in all regions)
resource "azurerm_service_plan" "functions" {
  name                = "${var.project_name}-functions-plan"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_function_app" "api" {
  name                = "${var.project_name}-api"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.functions.id
  storage_account_name       = var.storage_account_name
  storage_uses_managed_identity = false

  site_config {
    application_stack {
      node_version = "20"
    }
    cors {
      allowed_origins     = var.cors_allowed_origins
      support_credentials = false
    }
    application_insights_connection_string = var.app_insights_connection_string
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_NODE_DEFAULT_VERSION   = "~20"
    StorageConnectionString        = var.storage_connection_string
    ENTRA_CLIENT_ID                = var.entra_client_id
    ENTRA_TENANT_ID                = var.entra_tenant_id
  }

  identity {
    type = "SystemAssigned"
  }
}

# Diagnostic settings - Web App -> Log Analytics
resource "azurerm_monitor_diagnostic_setting" "webapp" {
  name                       = "${var.project_name}-to-logs"
  target_resource_id         = azurerm_linux_web_app.webapp.id
  log_analytics_workspace_id = var.log_analytics_workspace_id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
  enabled_log {
    category = "AppServicePlatformLogs"
  }
  enabled_log {
    category = "AppServiceAppLogs"
  }
}
