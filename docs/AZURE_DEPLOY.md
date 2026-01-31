# Deploy Movie-Man Front to Azure Container Instances

Walkthrough for deploying the frontend container with a public IP.

---

## Step 0: Prerequisites

### Install Azure CLI (if needed)

**Linux (Debian/Ubuntu):**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**macOS:**
```bash
brew install azure-cli
```

### Login to Azure
```bash
az login
```
A browser window opens for authentication.

### Ensure you're on the Azure-ready branch
```bash1
git checkout dev-azure
```

---

## Step 1: Set Variables

Choose unique names (ACR names must be globally unique, 5–50 alphanumeric chars):

```bash
# Replace with your values
RESOURCE_GROUP="movie-man-rg"
LOCATION="westus2"
ACR_NAME="moviemanacr"          # Must be globally unique
CONTAINER_NAME="movie-man-front"
DNS_LABEL="movie-man-front"     # Becomes: movie-man-front.westus2.azurecontainer.io
```

---

## Step 2: Create Resource Group

```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

---

## Step 3: Create Azure Container Registry (ACR)

```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic
```

---

## Step 4: Login to ACR and Push Image

```bash
# Login Docker to ACR
az acr login --name $ACR_NAME

# Build the image (from project root)
cd front
docker build -t $ACR_NAME.azurecr.io/movie-man-front:latest .

# Push to ACR
docker push $ACR_NAME.azurecr.io/movie-man-front:latest
cd ..
```

---

## Step 5: Get ACR Credentials

```bash
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
```

---

## Step 6: Create Container Instance with Public IP

```bash
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_NAME.azurecr.io/movie-man-front:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label $DNS_LABEL \
  --ports 80 \
  --os-type Linux \
  --cpu 1 \
  --memory 1.5
```

---

## Step 7: Get Public URL

```bash
az container show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --query "{FQDN:ipAddress.fqdn, IP:ipAddress.ip, State:instanceView.state}" -o table
```

Open in browser: `http://<FQDN>` (e.g. `http://movie-man-front.westus2.azurecontainer.io`)

---

## Optional: Add Log Analytics

For log collection in Azure Monitor:

```bash
# Create workspace
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name movie-man-logs

# Get IDs
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name movie-man-logs \
  --query customerId -o tsv)
WORKSPACE_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group $RESOURCE_GROUP \
  --workspace-name movie-man-logs \
  --query primarySharedKey -o tsv)

# Delete existing container and recreate with logging
az container delete --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME -y

az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_NAME.azurecr.io/movie-man-front:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --log-analytics-workspace $WORKSPACE_ID \
  --log-analytics-workspace-key $WORKSPACE_KEY \
  --dns-name-label $DNS_LABEL \
  --ports 80 \
  --os-type Linux \
  --cpu 1 \
  --memory 1.5
```

---

## Useful Commands

| Action | Command |
|--------|---------|
| View logs | `az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME` |
| Follow logs | `az container attach --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME` |
| Stop | `az container stop --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME` |
| Start | `az container start --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME` |
| Delete | `az container delete --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME -y` |

---

## Cleanup

To remove all resources:

```bash
az group delete --name $RESOURCE_GROUP -y
```
