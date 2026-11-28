#!/bin/bash
set -euo pipefail

# 1. System updates & dependencies
dnf update -y
dnf install -y git nginx amazon-cloudwatch-agent

# 2. Install Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm install -g pm2

# 3. Prepare log & application directories
mkdir -p /var/log/hirehub /opt/hirehub
chown -R ec2-user:ec2-user /var/log/hirehub /opt/hirehub

# 4. Pull application artifact / repository (replace with S3 artifact or ECR/CodeDeploy in CI/CD)
# aws s3 cp s3://hirehub-artifacts-production/backend/latest.tar.gz /opt/hirehub/latest.tar.gz
# tar -xzf /opt/hirehub/latest.tar.gz -C /opt/hirehub

# 5. Configure environment (Secrets Manager handles sensitive keys at runtime)
cat << 'EOF' > /opt/hirehub/backend/.env
NODE_ENV=production
PORT=8000
AWS_REGION=us-east-1
AWS_USE_IAM_ROLE=true
AWS_SECRET_NAME=hirehub/production/app-secrets
AWS_RDS_SECRET_NAME=hirehub/production/rds-credentials
DATABASE_DIALECT=mysql
DATABASE_SSL=true
EOF

# 6. Start Node.js with PM2 cluster mode & log shipping
cd /opt/hirehub/backend
npm ci --omit=dev
pm2 start index.js --name hirehub-api -i max \
  --output /var/log/hirehub/app-out.log \
  --error /var/log/hirehub/app-err.log \
  --merge-logs
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# 7. Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/hirehub/infra/cloudwatch/cloudwatch-agent-config.json -s

# 8. Configure Nginx reverse proxy -> localhost:8000
cat << 'EOF' > /etc/nginx/conf.d/hirehub.conf
server {
    listen 80;
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
systemctl enable --now nginx
