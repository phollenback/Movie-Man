# Import existing resources

If the Container App was created outside Terraform (e.g. by CI/CD), import it before `terraform apply`:

```bash
terraform import -var="entra_client_id=<your-id>" -var="entra_tenant_id=common" \
  azurerm_container_app.frontend \
  "/subscriptions/<sub-id>/resourceGroups/movie-man-container-rg/providers/Microsoft.App/containerApps/moviemanc"
```

Replace `<sub-id>` with your Azure subscription ID and `<your-id>` with your Entra client ID.
