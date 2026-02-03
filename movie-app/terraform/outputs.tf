output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "webapp_url" {
  value = "https://${module.app.webapp_default_hostname}"
}

output "api_url" {
  value = "https://${module.app.functionapp_default_hostname}/api"
}

output "acr_login_server" {
  value = module.registry.login_server
}
