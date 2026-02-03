output "webapp_default_hostname" {
  value = azurerm_linux_web_app.webapp.default_hostname
}

output "functionapp_default_hostname" {
  value = azurerm_linux_function_app.api.default_hostname
}

output "webapp_id" {
  value = azurerm_linux_web_app.webapp.id
}
