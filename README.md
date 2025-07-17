**Deployment Overview
	•	Environment: Amazon EC2 (Amazon Linux 2)
	•	Web Server: Apache (httpd)**

⸻

**_Most Recent Commit: Deployment to EC2_**

This commit demonstrates the successful deployment of a SPA to a cloud-based production environment using AWS EC2 and Apache. This was a proof of concept that upgraded an old project in order to gain some hands on experience using key AWS services.

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
