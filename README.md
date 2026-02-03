# Movie-Man

React frontend for searching movies, managing a watchlist, and logging what you've watched. Authenticates with Microsoft Entra ID. Backend: Azure Functions + Table Storage.

## Repo structure

```
Movie-Man/
├── front/                 # Shared React app
├── api/                   # Shared Azure Functions API
├── movie-app/
│   └── terraform/         # App Service solution
├── movie-container/
│   └── terraform/         # ACA (Container Apps) solution
└── scripts/
```

## Solutions

| Solution | Frontend | Cost model |
|----------|----------|------------|
| **movie-app** | App Service (B1) | Fixed ~$13/mo |
| **movie-container** | Azure Container Apps (Consumption) | Scale-to-zero, pay per use |

Both use the same API (Azure Functions B1 + Table Storage).

## Spin up / down

```bash
# movie-app (App Service)
cd movie-app/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with entra_client_id
terraform init && terraform apply

# movie-container (ACA)
cd movie-container/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with entra_client_id
terraform init && terraform apply
```

Spin down: `terraform destroy` in the respective directory.

## CI/CD

GitHub Actions deploy on push to `main` or `dev-azure` (when `front/`, `api/`, or workflows change):

- **deploy-movie-app.yml** – App Service + Functions (`movie-man-app-rg`)
- **deploy-movie-container.yml** – Container Apps + Functions (`movie-man-container-rg`)

Required secrets: `AZURE_CREDENTIALS`, `ENTRA_CLIENT_ID`, `OMDB_API_KEY`.

## Local development

See `docs/LOCAL_RUN.md` (local only, not in repo).

## Prerequisites

- Azure CLI, Terraform >= 1.0
- Entra app registration with redirect URIs for your frontend URLs
- OMDB API key
