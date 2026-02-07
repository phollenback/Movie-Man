# Movie-Man

React frontend for searching movies, managing a watchlist, and logging what you've watched. Authenticates with Microsoft Entra ID. Backend: Azure Functions + Table Storage.

**Primary deployment:** Azure Container Apps (ACA) — scale-to-zero, consumption pricing.

## Repo structure

```
Movie-Man/
├── front/                 # React app
├── api/                   # Azure Functions API
├── movie-app/
│   └── terraform/         # App Service solution (optional)
└── movie-container/
    └── terraform/         # ACA solution (primary)
```

## Branch strategy

| Branch | Role |
|--------|------|
| `dev-azure` | Development — no auto-deploy |
| `container-service` | Deploys to ACA on push |
| `app-service` | Deploys to App Service (optional) |

## Primary: ACA (Container Apps)

- **Resource group:** `movie-man-container-rg`
- **Terraform:** `movie-container/terraform/`

```bash
cd movie-container/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with entra_client_id
terraform init && terraform apply
```

Spin down: `terraform destroy -var="entra_client_id=<id>" -var="entra_tenant_id=common"`

## CI/CD

Push to `container-service` triggers deployment:

- **deploy-movie-container.yml** — builds frontend image, pushes to ACR, updates Container App

Required GitHub secrets: `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_TENANT_ID`, `OMDB_API_KEY`.

## Optional: App Service

- **Resource group:** `movie-man-app-rg`
- **Terraform:** `movie-app/terraform/`

Same flow: copy `terraform.tfvars.example` → `terraform.tfvars`, add `entra_client_id`, then `terraform init && terraform apply`.

## Prerequisites

- Azure CLI, Terraform ≥ 1.0
- Entra app registration with redirect URIs for frontend
- OMDB API key
