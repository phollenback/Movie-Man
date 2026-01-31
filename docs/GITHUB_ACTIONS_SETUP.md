# GitHub Actions CI/CD Setup Guide

Deploy **dev-azure** branch to Azure App Service **movieman** on every push.

---

## Overview

```
dev-azure (push) → GitHub Actions → Build Docker → Push to ACR → Deploy to App Service
```

---

## Step 1: Azure Infrastructure

Run these commands (Azure CLI). Use the same resource group and ACR you already have.

### 1.1 Set Variables

```bash
RESOURCE_GROUP="movie-man-rg"
LOCATION="westus2"
ACR_NAME="moviemanacr"
APP_NAME="movieman"
APP_PLAN="movieman-plan"
```

### 1.2 Create App Service Plan (if not exists)

```bash
az appservice plan create \
  --name $APP_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1
```

### 1.3 Create Web App for Containers

```bash
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN \
  --deployment-container-image-name $ACR_NAME.azurecr.io/movie-man-front:latest
```

### 1.4 Enable ACR Pull for App Service

```bash
# Enable admin user on ACR (if not already)
az acr update --name $ACR_NAME --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Configure App Service to use ACR
az webapp config container set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/movie-man-front:latest \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD
```

### 1.5 Set Port (nginx uses 80)

```bash
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings WEBSITES_PORT=80
```

### 1.6 (Optional) Enable Always On

```bash
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --always-on true
```

---

## Step 2: Create Service Principal for GitHub Actions

The workflow needs an Azure identity to push to ACR and deploy to App Service.

### 2.1 Create Service Principal

```bash
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create service principal with Contributor on resource group
az ad sp create-for-rbac \
  --name "github-movieman-deploy" \
  --role "Contributor" \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

### 2.2 Copy the Output

The command outputs JSON. **Copy the entire JSON** (including all keys like `activeDirectoryEndpointUrl`, etc.) — you'll add it to GitHub secrets.

> ⚠️ **Never commit this JSON to git.** Add it only as a GitHub secret.

---

## Step 3: GitHub Secrets

### 3.1 Add AZURE_CREDENTIALS

1. Go to your repo: **https://github.com/phollenback/Movie-Man**
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste the **entire JSON** from Step 2.2

The JSON must include at least:
```json
{
  "clientId": "<from create-for-rbac>",
  "clientSecret": "<from create-for-rbac>",
  "subscriptionId": "<your-subscription-id>",
  "tenantId": "<your-tenant-id>"
}
```

Use the output of `az ad sp create-for-rbac ... --sdk-auth` for the correct format.

---

## Step 4: Verify Workflow Variables

The workflow uses these (in `.github/workflows/deploy.yml`):

| Variable | Value | Override |
|----------|-------|----------|
| `AZURE_WEBAPP_NAME` | movieman | Change `env:` in workflow |
| `RESOURCE_GROUP` | movie-man-rg | Change `env:` in workflow |
| `ACR_NAME` | moviemanacr | Change `env:` in workflow |
| `IMAGE_NAME` | movie-man-front | Change `env:` in workflow |

If your App Service or resource group have different names, edit the `env:` block in `.github/workflows/deploy.yml`.

---

## Step 5: Push to Trigger

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin dev-azure
```

Then check **Actions** tab in GitHub — the workflow should run.

---

## Troubleshooting

### "Authorization failed" when pushing to ACR

Ensure the service principal has **AcrPush** or **Contributor** on the ACR:

```bash
ACR_ID=$(az acr show --name moviemanacr --query id -o tsv)
SP_APP_ID="<clientId from AZURE_CREDENTIALS>"
az role assignment create \
  --assignee $SP_APP_ID \
  --role AcrPush \
  --scope $ACR_ID
```

### App Service shows old version

- Check that the workflow completed successfully
- Verify App Service container config: `az webapp config container show --name movieman --resource-group movie-man-rg`
- Restart: `az webapp restart --name movieman --resource-group movie-man-rg`

### Workflow fails at "Log in to ACR"

`az acr login` uses the Azure CLI session. Ensure `AZURE_CREDENTIALS` has Contributor (or AcrPush) on the resource group/ACR.

---

## One-Time Full Setup Script

Save as `scripts/setup-azure-app.sh` and run:

```bash
#!/bin/bash
set -e
RESOURCE_GROUP="movie-man-rg"
LOCATION="westus2"
ACR_NAME="moviemanacr"
APP_NAME="movieman"
APP_PLAN="movieman-plan"

az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP \
  --location $LOCATION --is-linux --sku B1 2>/dev/null || true

az webapp create --name $APP_NAME --resource-group $RESOURCE_GROUP \
  --plan $APP_PLAN --deployment-container-image-name $ACR_NAME.azurecr.io/movie-man-front:latest 2>/dev/null || true

az acr update --name $ACR_NAME --admin-enabled true
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

az webapp config container set --name $APP_NAME --resource-group $RESOURCE_GROUP \
  --docker-custom-image-name $ACR_NAME.azurecr.io/movie-man-front:latest \
  --docker-registry-server-url https://$ACR_NAME.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP \
  --settings WEBSITES_PORT=80

echo "App URL: https://$APP_NAME.azurewebsites.net"
echo "Now create service principal: az ad sp create-for-rbac --name github-movieman-deploy --role Contributor --scopes /subscriptions/\$(az account show -q id -o tsv)/resourceGroups/$RESOURCE_GROUP --sdk-auth"
```
