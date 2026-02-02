**Deployment Overview
	•	Environment: Amazon EC2 (Amazon Linux 2)
	•	Web Server: Apache (httpd)**

⸻

**_Most Recent Commit: Azure App Service + GitHub Actions CI/CD_**

Deploy to Azure via push to `dev-azure`. Required GitHub secrets: `AZURE_CREDENTIALS`, `ENTRA_CLIENT_ID`, `OMDB_API_KEY`.

**Logs / monitoring (movie-man-rg):** All monitoring is in the same resource group. **movieman-insights** (Application Insights) and **movieman-logs** (Log Analytics) store telemetry and logs.

| Where | Purpose |
|-------|---------|
| **movieman** (web app) → Monitoring → Log stream | Live container stdout/stderr |
| **movieman-insights** → Logs | Application Insights: `requests`, `traces`, `exceptions` |
| **movieman-logs** → Logs | App Service logs: `AppRequests`, `AppTraces`, `AppServiceHTTPLogs`, `AppServiceConsoleLogs` |

KQL examples in **movieman-logs** or **movieman-insights** → Logs:
```
AppRequests | take 50
AppTraces | take 50
AppServiceConsoleLogs | take 50
```

⸻

**_EC2 Server Management Overview_**

This deployment highlights the ability to independently provision, configure, and maintain a production server using the following tools and practices:

⸻

**_EC2 Instance Management_**
	•	Connected via SSH using a secure key pair
	•	Maintained access control using AWS Security Groups
	•	Enabled Apache to start automatically using systemctl

⸻

**_Apache (httpd) Setup_**
	•	Installed Apache as the primary web server
	•	Configured Apache to serve static files from /var/www/html
	•	Enabled Apache to persist on system reboot (systemctl enable httpd)

⸻

**_Git-Based Deployment_**
	•	Cloned the project from GitHub using Git
	•	Pulled the latest code directly onto the EC2 instance
	•	Used npm run build to generate frontend assets
	•	Deployed the compiled output into Apache’s serving directory
<img width="1436" height="802" alt="Screenshot 2025-07-16 at 5 34 28 PM" src="https://github.com/user-attachments/assets/237d2d16-7961-406e-9f5a-1f89a3282048" />
