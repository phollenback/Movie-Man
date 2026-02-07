# Bootstrap and Import

## First-time setup

Terraform uses a public bootstrap image (`mcr.microsoft.com/azuredocs/containerapps-helloworld:latest`) so the Container App can be created before any image exists in ACR. After `terraform apply`:

1. Run the **Deploy Movie-Container (ACA)** workflow (push to `container-service` or manual trigger).
2. The workflow builds the frontend image, pushes to ACR, and updates the Container App to the real image.

## Import existing resources

If the Container App was created outside Terraform (e.g. by CI/CD), import it before `terraform apply`:

```bash
terraform import -var="entra_client_id=<your-id>" -var="entra_tenant_id=common" \
  azurerm_container_app.frontend \
  "/subscriptions/<sub-id>/resourceGroups/movie-man-container-rg/providers/Microsoft.App/containerApps/moviemanc"
```

Replace `<sub-id>` with your Azure subscription ID and `<your-id>` with your Entra client ID.
