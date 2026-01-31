#!/bin/bash
# One-time setup: Create App Service and configure for GitHub Actions deployment
set -e

RESOURCE_GROUP="movie-man-rg"
LOCATION="westus2"
ACR_NAME="moviemanacr"
APP_NAME="movieman"
APP_PLAN="movieman-plan"

echo "Creating App Service Plan..."
az appservice plan create \
  --name $APP_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1 2>/dev/null || echo "  (plan may already exist)"

echo "Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --deployment-container-image-name $ACR_NAME.azurecr.io/movie-man-front:latest 2>/dev/null || echo "  (app may already exist)"

echo "Configuring ACR credentials..."
az acr update --name $ACR_NAME --admin-enabled true
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/movie-man-front:latest \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

echo "Setting WEBSITES_PORT=80..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings WEBSITES_PORT=80 --output none

echo ""
echo "✓ App Service ready: https://$APP_NAME.azurewebsites.net"
echo ""
echo "Next: Create service principal for GitHub Actions:"
echo "  az ad sp create-for-rbac --name github-movieman-deploy --role Contributor --scopes /subscriptions/\$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"
echo ""
echo "Add the JSON output as GitHub secret: AZURE_CREDENTIALS"
