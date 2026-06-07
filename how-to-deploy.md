# How to Deploy Clap! on AWS

This guide covers deploying the full Clap! stack on AWS:
- S3 bucket for build artifacts and assets
- SES for transactional emails
- WebSocket collaboration server
- PostgreSQL database
- Next.js application server (EC2)

---

## Prerequisites

- An AWS account with admin or sufficient IAM permissions (S3, SES, EC2)
- A domain name (e.g. `parlemonde.org`) managed in Route 53 (or equivalent)
- An EC2 instance running Amazon Linux 2023, with Node.js 24 installed via nvm

---

## 1. S3 Bucket

The S3 bucket holds build artifacts (zipped application) and static assets.

1. Go to the **S3 Console** → **Create bucket**
2. Bucket name: `clap-plm`
3. Region: `eu-west-3` (Paris)
4. Leave the rest as default → **Create bucket**

### Enable versioning (recommended)

1. Click on the `clap-plm` bucket
2. Go to the **Properties** tab
3. Scroll to **Bucket Versioning** → **Edit**
4. Select **Enable** → **Save changes**

---

## 2. SES — Email Sending

Request production access and verify your domain in SES (eu-west-3).

### 2.1 Move out of sandbox

1. Go to the **SES Console** → **Account dashboard**
2. Click **Request production access**
3. Follow the wizard — describe that you send transactional emails to registered users

### 2.2 Verify the domain

1. In the SES Console → **Verified identities** → **Create identity**
2. Choose **Domain** → enter `clap.parlemonde.org`
3. Leave **DKIM** enabled, select **Easy DKIM**
4. Click **Create identity**
5. AWS shows a TXT verification record and 3 DKIM CNAME records. Add all of them to your DNS zone (Route 53 or equivalent)

Once DNS propagates, the identity status turns to **Verified**.

### 2.3 Custom MAIL FROM (recommended)

1. Click on the `clap.parlemonde.org` identity
2. Go to the **MAIL FROM domain** section → **Edit**
3. Set MAIL FROM domain to `mail.clap.parlemonde.org` → **Save**
4. Add the MX record shown, plus a TXT SPF record, to your DNS

| Type | Name                                   | Value                                  |
|------|----------------------------------------|----------------------------------------|
| MX   | `mail.clap.parlemonde.org`             | `feedback-smtp.eu-west-3.amazonses.com` |
| TXT  | `mail.clap.parlemonde.org`             | `v=spf1 include:amazonses.com ~all`     |

### 2.4 SMTP credentials

1. In the SES Console → **SMTP settings** → **Create SMTP credentials**
2. Follow the wizard to generate an IAM user with SMTP permissions
3. Note the **SMTP username** and **SMTP password** — they become `NODEMAILER_USER` and `NODEMAILER_PASS` in the env file

---

## 3. WebSocket Collaboration Server

The websockets server is deployed separately from its own repository. It is assumed to be already running and accessible at `wss://websockets.parlemonde.org`.

Retrieve the `COLLABORATION_SERVER_SECRET` from the websockets deployment. You will need it in step 4 when setting the app environment variables.

---

## 4. Production EC2 — Application Server

The main application runs on a single EC2 instance that hosts both the Next.js app and PostgreSQL.

### 4.1 Launch EC2

- AMI: Amazon Linux 2023
- Instance type: at least t3.medium (PostgreSQL needs RAM)
- Security group:
  - Port **3000** (app): open to CloudFront origin-facing IP ranges only (see note below)
  - Port **22** (SSH): open to your IP only
  - Port **5432** (PostgreSQL): open to your IP only

> **CloudFront IP ranges**: In the EC2 Security Group, do NOT open port 3000 to `0.0.0.0/0`. Instead, use the [AWS-managed prefix list for CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html) (`com.amazonaws.global.cloudfront.origin-facing`) as the source. If your region does not support managed prefix lists, download the CloudFront IP ranges from the link above and add each CIDR individually.

### 4.2 Install Node.js 24

```bash
# On the production EC2
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.bashrc
nvm install 24
nvm alias default 24
```

Verify:

```bash
node --version   # should be v24.x
```

### 4.3 Install and set up PostgreSQL

```bash
sudo dnf install -y postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4.4 Create database and application user

Connect as the `postgres` system superuser:

```bash
sudo -u postgres psql
```

Then inside psql:

```sql
CREATE USER clap WITH PASSWORD '<generate-a-db-password>';
CREATE DATABASE clap OWNER clap;
GRANT ALL PRIVILEGES ON DATABASE clap TO clap;
\c clap
GRANT ALL ON SCHEMA public TO clap;
\q
```

Generate the DB password:

```bash
node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))"
```

### 4.5 Create the environment file

On the production EC2, create `/home/ec2-user/clap.env`:

```bash
cat > /home/ec2-user/clap.env << 'EOF'
NODE_ENV=production
NEXT_RUNTIME=nodejs

APP_SECRET=<generate>
BETTER_AUTH_SECRET=<generate>

HOST_URL=https://clap.parlemonde.org
BETTER_AUTH_URL=https://clap.parlemonde.org

DATABASE_URL=postgres://clap:<db-password>@localhost:5432/clap?sslmode=disable
OTEL_EXPORTER_OTLP_ENDPOINT=<otel-endpoint>  # optional, remove if not using OTEL

AWS_ACCESS_KEY_ID=<iam-access-key>
AWS_SECRET_ACCESS_KEY=<iam-secret-key>
AWS_REGION=eu-west-3
S3_BUCKET_NAME=clap-plm

COLLABORATION_SERVER_URL=wss://websockets.parlemonde.org
COLLABORATION_SERVER_SECRET=<same-secret-as-websockets-env>

HOST_DOMAIN=clap.parlemonde.org
NODEMAILER_USER=<ses-smtp-username>
NODEMAILER_PASS=<ses-smtp-password>
NODEMAILER_HOST=email-smtp.eu-west-3.amazonaws.com
NODEMAILER_PORT=587

# Optional SSO
# SSO_HOST=https://prof.parlemonde.org
# CLIENT_ID=<sso-client-id>
# CLIENT_SECRET=<sso-client-secret>
EOF
```

Generate secrets:

```bash
# APP_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Set restrictive permissions:

```bash
chmod 600 /home/ec2-user/clap.env
```

### 4.6 Optional: seed an admin user

Add these lines to `clap.env` to auto-create an admin user on first migration:

```
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
ADMIN_NAME=<admin-display-name>
```

### 4.7 Create clap.service

```bash
sudo tee /etc/systemd/system/clap.service << 'EOF'
[Unit]
Description=Clap server
After=network.target

[Service]
WorkingDirectory=/home/ec2-user/clap
EnvironmentFile=/home/ec2-user/clap.env
Restart=on-failure
RestartSec=1s
User=ec2-user
Group=users

ExecStart=/home/ec2-user/.nvm/versions/node/v24.11.1/bin/node server.js

[Install]
WantedBy=multi-user.target
EOF
```

Adjust the Node.js path:

```bash
sudo sed -i "s|/home/ec2-user/.nvm/versions/node/.*/bin/node|$(nvm which node)|" /etc/systemd/system/clap.service
sudo systemctl daemon-reload
```

### 4.8 Create the deploy script

On the production EC2, create `/home/ec2-user/deploy.sh`:

```bash
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
sudo systemctl stop clap.service
aws s3 cp s3://clap-plm/builds/$1/clap.zip . --quiet
aws s3 rm s3://clap-plm/assets/ --recursive --quiet
aws s3 cp s3://clap-plm/builds/$1/assets/ s3://clap-plm/assets/ --recursive --quiet
rm -rf clap
unzip -qq clap.zip -d clap
rm -rf clap.zip
sudo systemctl start clap.service
EOF
```

```bash
chmod +x /home/ec2-user/deploy.sh
```

---

## 5. CloudFront CDN

Create a CloudFront distribution that sits in front of both the S3 assets bucket and the EC2 app server.

### 5.1 Create the distribution

1. Go to the **CloudFront Console** → **Create distribution**
2. Under **Origin**, fill in:

### Origin 1 — S3 assets

- **Origin domain**: select the `clap-plm` bucket from the dropdown (it should appear as `clap-plm.s3.eu-west-3.amazonaws.com`)
- **Origin path**: `/assets`

### Origin 2 — EC2 application server

- Click **Add origin**
- **Origin domain**: enter the EC2 public DNS (e.g. `ec2-xx-xx-xx-xx.eu-west-3.compute.amazonaws.com`)
- **Protocol**: HTTP only
- **HTTP port**: `3000`
- Leave origin path empty

### 5.2 Cache behaviors (ordered — most specific first)

After creating the origins, configure the following cache behaviors. They are evaluated in order; put the most specific paths first.

| Precedence | Path pattern         | Origin  | Cache policy                                          |
|------------|----------------------|---------|-------------------------------------------------------|
| 0          | `_next/static/*`     | S3      | *(any managed policy, content is fingerprinted)*      |
| 1          | `favicon.ico`        | S3      | *(any managed policy)*                                |
| 2          | `static/*`           | S3      | *(any managed policy)*                                |
| 3          | `media/*`            | EC2     | `CachingOptimized` with `UseOriginCacheControlHeaders-QueryStrings` |
| 4          | `Default (*)`        | EC2     | `CachingDisabled`                                     |

For behavior 3 (`media/*`):
- In the **Cache key and origin requests** section, select **Cache policy** → choose `CachingOptimized`
- Then, select **Origin request policy** → choose `UseOriginCacheControlHeaders-QueryStrings`

For behavior 4 (Default `*`):
- Set **Cache policy** to `CachingDisabled` (this ensures dynamic HTML pages are never cached)

### 5.3 Alternate domain name & SSL

1. Under **Settings** → **Alternate domain name (CNAME)**, add `clap.parlemonde.org`
2. In **Custom SSL certificate**, request or select a certificate for `clap.parlemonde.org` (via ACM)
3. Click **Create distribution**

### 5.4 Route the domain to CloudFront

In your DNS (Route 53), point `clap.parlemonde.org` to the CloudFront distribution domain name (`d1234.cloudfront.net`) using an ALIAS (A) record.

---

## 6. Run Database Migrations

The first time you deploy (and after any schema change), run the migration script.

You can do this from your CI workflow or manually:

```bash
# From your local machine (with DATABASE_URL pointing to the EC2)
DATABASE_URL=postgres://clap:<password>@<ec2-ip>:5432/clap?sslmode=disable \
  pnpm tsx src/server/database/migrate.ts
```

If you set `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars, the migration also seeds the admin user.

---

## 7. First Build and Deploy

### 7.1 Build locally (or via CI)

```bash
pnpm install
pnpm build
```

### 7.2 Prepare and upload the build

```bash
mkdir -p dist/assets/_next
mv .next/static dist/assets/_next
cp -r public/* dist/assets
cp -r public .next/standalone
(cd .next/standalone && zip --symlinks -r - .) > dist/clap.zip
```

Upload to S3 (replace `<sha>` with a commit hash or version tag):

1. Go to the **S3 Console** → open the `clap-plm` bucket
2. Navigate into `builds/` (create the folder if it doesn't exist)
3. Create a new folder named `<sha>`
4. Inside that folder, click **Upload** → **Add files**
5. Select `dist/clap.zip` and everything under `dist/assets/`
6. Click **Upload**

### 7.3 Deploy to the server

SSH into the production EC2 and run:

```bash
ssh ec2-user@<prod-ec2-ip> "./deploy.sh <sha>"
```

Or trigger the full CI pipeline (Build + Deploy workflows).

---

## 8. Optional — SSO Configuration

To connect Clap! to an external SSO provider (OAuth 2 / OIDC), set these variables in `/home/ec2-user/clap.env`:

```
SSO_HOST=https://prof.parlemonde.org
CLIENT_ID=<sso-client-id>
CLIENT_SECRET=<sso-client-secret>
```

Then restart the service:

```bash
sudo systemctl restart clap.service
```

---

## 9. Rollback

To roll back to a previous build, SSH into the production EC2 and run the deploy script with the sha of the previous build:

```bash
ssh ec2-user@<prod-ec2-ip> "./deploy.sh <previous-sha>"
```

The deploy script stops the service, downloads the specified build, syncs its assets to the live S3 assets path, unpacks it, and starts the service again.

---

## 10. Useful Commands

```bash
# Check service status
sudo systemctl status clap.service

# View logs
sudo journalctl -u clap.service -f

# Restart the app
sudo systemctl restart clap.service

# Check PostgreSQL status
sudo systemctl status postgresql
```

To browse uploaded builds, open the **S3 Console** → `clap-plm` bucket → `builds/`.

---

## 11. GitHub Actions Secrets

The CI/CD pipelines (`.github/workflows/build.yml` and `deploy.yml`) require the following secrets configured in the repository.

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

### Build workflow

| Secret name            | Value                                                 |
|------------------------|-------------------------------------------------------|
| `AWS_ACCESS_KEY_ID`    | IAM access key ID with S3 write permissions           |
| `AWS_SECRET_ACCESS_KEY`| IAM secret access key                                 |
| `AWS_REGION`           | `eu-west-3`                                           |
| `AWS_BUCKET_NAME`      | `clap-plm`                                            |

### Deploy workflow

| Secret name                | Value                                                 |
|----------------------------|-------------------------------------------------------|
| `AWS_ACCESS_KEY_ID`        | IAM access key ID (same as above, needs S3 + EC2 permissions) |
| `AWS_SECRET_ACCESS_KEY`    | IAM secret access key                                 |
| `AWS_REGION`               | `eu-west-3`                                           |
| `AWS_SECURITY_GROUP_NAME`  | Name of the EC2 security group (e.g. `clap-sg`)       |
| `DATABASE_URL`             | `postgres://clap:<password>@<ec2-ip>:5432/clap?sslmode=disable` |
| `SSH_PRIVATE_KEY`          | PEM private key for SSH access to the EC2 instance    |
| `SSH_KNOWN_HOSTS`          | SSH known hosts entry for the EC2 instance            |
| `SERVER_URL`               | SSH connection string (e.g. `ec2-user@<ec2-ip>`)      |
| `DEV_PORTAL_URL`           | Dev portal base URL (optional, for deploy-state tracking) |
| `DEV_PORTAL_DEPLOY_TOKEN`  | Bearer token for the dev portal API (optional)        |

### How to obtain each secret

**IAM credentials** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`):
Create an IAM user with `AmazonS3FullAccess` and `AmazonEC2FullAccess` policies. Generate an access key in the IAM Console.

**Security group** (`AWS_SECURITY_GROUP_NAME`):
Use the name of the security group attached to your EC2 instance (visible in the EC2 Console). This is used by the deploy workflow to temporarily allow the GitHub Actions runner IP for SSH and DB access.

**Database URL** (`DATABASE_URL`):
Same value as in `clap.env`, but use the EC2 public IP instead of `localhost` so the GitHub runner can reach it.

**SSH credentials** (`SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SERVER_URL`):
- `SSH_PRIVATE_KEY`: the content of the `.pem` key file used to SSH into the EC2 (`cat ~/.ssh/clap-key.pem`)
- `SSH_KNOWN_HOSTS`: run `ssh-keyscan <ec2-ip>` and use the output
- `SERVER_URL`: `ec2-user@<ec2-ip>`
