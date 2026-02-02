#!/bin/bash
# Create Azure Storage account and tables for Movie-Man watchlist/watched
set -e

RG="movie-man-rg"
STORAGE="moviemanstorage"
LOCATION="westus2"

echo "Creating storage account $STORAGE..."
az storage account create \
  --name "$STORAGE" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --output table

echo "Creating tables..."
KEY=$(az storage account keys list --account-name "$STORAGE" --resource-group "$RG" --query "[0].value" -o tsv)
az storage table create --name Watchlist --account-name "$STORAGE" --account-key "$KEY"
az storage table create --name Watched --account-name "$STORAGE" --account-key "$KEY"

echo ""
echo "Connection string (add to api/local.settings.json as StorageConnectionString):"
az storage account show-connection-string --name "$STORAGE" --resource-group "$RG" --query connectionString -o tsv
