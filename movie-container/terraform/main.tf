resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

module "storage" {
  source = "./modules/storage"

  resource_group_name  = azurerm_resource_group.main.name
  location             = azurerm_resource_group.main.location
  storage_account_name = "${var.project_name}storage"
}

module "monitoring" {
  source = "./modules/monitoring"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  retention_days      = var.log_retention_days
}

module "registry" {
  source = "./modules/registry"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  acr_name           = "${var.project_name}acr"
}

# Container Apps Environment (Consumption plan - scale to zero)
resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
}

# Container App - Frontend (replaces App Service)
# Uses public bootstrap image initially; workflow deploys real image to ACR and updates via az containerapp update.
resource "azurerm_container_app" "frontend" {
  name                         = var.project_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  secret {
    name  = "acr-password"
    value = module.registry.admin_password
  }

  registry {
    server               = module.registry.login_server
    username             = module.registry.admin_username
    password_secret_name = "acr-password"
  }

  template {
    min_replicas = 0
    max_replicas = 3

    container {
      name   = "frontend"
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      liveness_probe {
        port                     = 80
        transport                = "HTTP"
        path                     = "/"
        initial_delay            = 10
        interval_seconds         = 20
        failure_count_threshold  = 3
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [template[0].container[0].image]
  }
}

# Function App - B1 (same as movie-app)
resource "azurerm_service_plan" "functions" {
  name                = "${var.project_name}-functions-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_function_app" "api" {
  name                       = "${var.project_name}-api"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  service_plan_id            = azurerm_service_plan.functions.id
  storage_account_name       = module.storage.storage_account_name
  storage_uses_managed_identity = false

  site_config {
    application_stack {
      node_version = "20"
    }
    cors {
      allowed_origins     = [var.frontend_fqdn, "http://localhost:3000", "http://localhost:8080"]
      support_credentials = false
    }
    application_insights_connection_string = module.monitoring.app_insights_connection_string
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME     = "node"
    WEBSITE_NODE_DEFAULT_VERSION = "~20"
    StorageConnectionString      = module.storage.primary_connection_string
    ENTRA_CLIENT_ID              = var.entra_client_id
    ENTRA_TENANT_ID              = var.entra_tenant_id
  }

  identity {
    type = "SystemAssigned"
  }
}

# Entra app redirect URIs - set before any deploy so auth works
data "azuread_application" "entra" {
  client_id = var.entra_client_id
}

resource "azuread_application_redirect_uris" "entra_spa" {
  application_id = data.azuread_application.entra.id
  type           = "SPA"

  # Must match REACT_APP_REDIRECT_URI (workflow FRONTEND_URL) and window.location.origin
  redirect_uris = [
    var.frontend_fqdn,
    "${var.frontend_fqdn}/",
    "http://localhost:3000",
    "http://localhost:3000/",
  ]
}

# Diagnostic settings - Function App -> Log Analytics
resource "azurerm_monitor_diagnostic_setting" "function" {
  name                       = "${var.project_name}-api-to-logs"
  target_resource_id         = azurerm_linux_function_app.api.id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id

  enabled_log {
    category = "FunctionAppLogs"
  }
}
