resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
}

resource "azurerm_storage_table" "watchlist" {
  name                 = "Watchlist"
  storage_account_name = azurerm_storage_account.main.name
}

resource "azurerm_storage_table" "watched" {
  name                 = "Watched"
  storage_account_name = azurerm_storage_account.main.name
}

resource "azurerm_storage_table" "users" {
  name                 = "Users"
  storage_account_name = azurerm_storage_account.main.name
}
