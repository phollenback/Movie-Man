output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "primary_connection_string" {
  value     = azurerm_storage_account.main.primary_connection_string
  sensitive = true
}

output "id" {
  value = azurerm_storage_account.main.id
}
