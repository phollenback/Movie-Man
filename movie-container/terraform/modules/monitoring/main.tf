resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project_name}-logs"
  resource_group_name = var.resource_group_name
  location            = var.location
  retention_in_days   = var.retention_days
  sku                 = "PerGB2018"
}

resource "azurerm_application_insights" "webapp" {
  name                = "${var.project_name}-insights"
  resource_group_name = var.resource_group_name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
}
