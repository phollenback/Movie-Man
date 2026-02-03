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
  acr_name            = "${var.project_name}acr"
}

module "app" {
  source = "./modules/app"

  resource_group_name            = azurerm_resource_group.main.name
  location                       = azurerm_resource_group.main.location
  project_name                   = var.project_name
  acr_login_server               = module.registry.login_server
  acr_admin_username             = module.registry.admin_username
  acr_admin_password             = module.registry.admin_password
  storage_account_name           = module.storage.storage_account_name
  storage_connection_string      = module.storage.primary_connection_string
  app_insights_connection_string = module.monitoring.app_insights_connection_string
  log_analytics_workspace_id     = module.monitoring.log_analytics_workspace_id
  entra_client_id                = var.entra_client_id
  entra_tenant_id                = var.entra_tenant_id
}
