- Environment: Amazon EC2 (Amazon Linux 2)

- Web Server: Apache (httpd)

⸻


**The most recent commit demonstrates the following**

EC2 Server Management Overview

This deployment demonstrates my ability to independently provision, configure, and manage a cloud-based production server using the following tools:

EC2 Instance Management
	•	Connected via SSH using a secure key pair
	•	Maintained permissions and firewall rules via AWS Security Groups
	•	Automated web server start with systemctl

Apache (httpd) Setup
	•	Installed and configured Apache as the primary web server
	•	Enabled persistent service on reboot (systemctl enable httpd)
	•	Deployed static site files to /var/www/html

Git-Based Deployment
	•	Cloned the project from GitHub using Git
	•	Pulled latest code directly into the instance
	•	Used npm run build for frontend assets (when applicable)
	•	Copied build output into Apache’s serving directory
