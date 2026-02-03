output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "frontend_url" {
  value = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
}

output "api_url" {
  value = "https://${azurerm_linux_function_app.api.default_hostname}/api"
}

output "acr_login_server" {
  value = module.registry.login_server
}
