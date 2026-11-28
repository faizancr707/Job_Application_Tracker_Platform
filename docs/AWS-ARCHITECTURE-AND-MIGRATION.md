# HireHub — AWS Cloud Architecture, Security & Migration Blueprint

**Role:** Senior AWS Cloud Architect  
**Target Stack:** Amazon S3, Amazon EC2 (Auto Scaling + ALB), Amazon RDS (MySQL 8.0 Multi-AZ), AWS IAM, Amazon CloudWatch, AWS Secrets Manager  

---

## 1. Existing Application Audit & Architectural Findings

| Component | Current Implementation | Production AWS Gap Identified | Remediation Implemented |
| :--- | :--- | :--- | :--- |
| **Compute / API** | Express 5.3.0 (`backend/index.js`) running single-process on `PORT=8000` | Single point of failure; no `trust proxy` for ALB headers; `/api/v1/health` didn't verify DB | Added `trust proxy`, deep DB health check (`200`/`503`), graceful `SIGTERM` shutdown, PM2 cluster + EC2 ASG |
| **Database** | Sequelize ORM (`MySQL` dialect, `DataTypes.INTEGER.UNSIGNED`, `TEXT('long')`) | Local MySQL; `UNSIGNED`/`TEXT('long')` are MySQL-specific | **Amazon RDS MySQL 8.0 Multi-AZ** in isolated private subnets preserves 100% schema compatibility |
| **File & Document Storage** | `s3.service.js` & `utils/s3.js` | Required static `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`; fell back to local disk if omitted | Updated to support **EC2 IAM Instance Profile (IMDSv2)** default credential chain automatically |
| **Secrets Management** | `.env` file via `dotenv` | Plaintext secrets on disk; no rotation | Added `secretsManager.service.js` to bootstrap `app-secrets` & auto-rotated `rds-credentials` before DB init |
| **Logging & Telemetry** | Plain `console.log` / `console.error` | Unstructured logs; no correlation IDs or latency tracking | Added `utils/logger.js` emitting single-line JSON + `X-Request-Id` for CloudWatch Logs Insights |

---

## 2. Target AWS Cloud Architecture

```
                        [ End Users / Browsers ]
                                   │
                     HTTPS (ACM TLS 1.3 Certificate)
                                   │
          ┌────────────────────────┴────────────────────────┐
          ▼                                                 ▼
[ CloudFront + S3 (Frontend) ]                [ Application Load Balancer (Public Subnets) ]
  • React/Vite Static Assets                    • Health Check: GET /api/v1/health
  • Origin Access Control (OAC)                 • WAF & Security Group (443/80)
                                                            │
                                                            ▼
                                              [ EC2 Auto Scaling Group (Private Subnets) ]
                                                • Graviton t4g.small (AL2023 + Nginx + PM2)
                                                • IMDSv2 Enforced + Least-Privilege IAM Role
                                                • SSM Session Manager (No SSH Port 22!)
                                                            │
                 ┌──────────────────┬───────────────────────┼───────────────────┐
                 ▼                  ▼                       ▼                   ▼
      [ S3 Gateway Endpoint ] [ Secrets Manager ]    [ CloudWatch ]      [ Amazon RDS MySQL 8.0 ]
                 │             • App Secrets         • JSON App Logs      • Multi-AZ (Primary+Standby)
                 ▼             • RDS Auto-Rotate     • Metrics & Alarms   • Isolated DB Subnets
      [ S3 Documents Bucket ]                        • SNS Email Alerts   • gp3 Encrypted + 14d Backups
        • Private / Pre-Signed URLs
        • SSE-AES256 + Versioning
        • 90d Standard-IA Lifecycle
```

---

## 3. Security, Access Control & Data Protection

1. **Zero-Trust Network Isolation (3-Tier VPC):**
   - **Public Subnets (`10.0.1.0/24`, `10.0.2.0/24`):** Only ALB and NAT Gateway reside here.
   - **Private App Subnets (`10.0.11.0/24`, `10.0.12.0/24`):** EC2 instances have no public IPs and accept HTTP only from `ALBSecurityGroup`. SSH port `22` is closed globally; administrators connect via **AWS Systems Manager (SSM) Session Manager**.
   - **Isolated DB Subnets (`10.0.21.0/24`, `10.0.22.0/24`):** RDS accepts port `3306` exclusively from `EC2SecurityGroup` over TLS (`DATABASE_SSL=true`).
2. **IAM Least Privilege (`infra/iam/ec2-instance-role-policy.json`):**
   - Static IAM Access Keys are eliminated on EC2. Instances authenticate via **IMDSv2** (`HttpTokens: required`).
   - S3 permissions are scoped strictly to `resumes/*`, `images/*`, `cover-letters/*`, and `uploads/*`.
3. **S3 Bucket Hardening (`infra/iam/s3-bucket-policy.json`):**
   - `BlockPublicAcls`, `BlockPublicPolicy`, `IgnorePublicAcls`, `RestrictPublicBuckets` all enabled.
   - Bucket policy denies non-TLS (`aws:SecureTransport: false`) and unencrypted `PutObject` requests.
4. **Secrets Manager:**
   - `hirehub/production/rds-credentials` (with 30-day automatic rotation).
   - `hirehub/production/app-secrets` (`JWT_SECRET`, `OPENAI_API_KEY`, `AWS_SES_FROM_EMAIL`).

---

## 4. Automated Backups, Monitoring & Cost Optimization

### Automated Backups & Disaster Recovery
- **RDS:** Automated daily snapshots with **14-day retention**, Point-in-Time Recovery (PITR) to any 5-minute window, **Multi-AZ** synchronous standby failover (< 60s), and `DeletionProtection: true`.
- **S3:** Bucket **Versioning** enabled to protect against accidental overwrites/deletes; noncurrent versions expire after 90 days.

### CloudWatch Monitoring & Alerting (`infra/cloudwatch/cloudwatch-agent-config.json`)
- **Log Groups:** `/hirehub/production/backend` (30d), `/hirehub/production/backend-errors` (90d), `/hirehub/production/nginx` (30d), plus RDS `error` and `slowquery` exports.
- **System Metrics:** CPU, Memory (`mem_used_percent`), and Disk (`used_percent`) at 60s granularity.
- **Alarms → SNS:** ALB `HTTPCode_Target_5XX_Count > 10` (5m), RDS `CPUUtilization > 80%`, RDS `FreeStorageSpace < 4GB`, EC2 `StatusCheckFailed`.

### Cost Optimization
- **AWS Graviton (`t4g.small` / `db.t4g.small`):** ~20%–30% lower compute cost with superior price-performance over x86 `t3`.
- **S3 VPC Gateway Endpoint:** Free endpoint routes all S3 document traffic directly within AWS, eliminating **$0.045/GB NAT Gateway data processing charges**.
- **S3 Lifecycle Rules:** Transition resumes > 90 days old to `STANDARD_IA`; archive logs > 30 days to `GLACIER_IR` and expire after 365 days.
- **gp3 Storage:** RDS uses `gp3` (20 GB baseline, autoscaling to 100 GB) saving ~20% vs `gp2`.

---

## 5. Phased Migration & Deployment Plan (Zero-Downtime)

### Phase 1: Provision Infrastructure
1. Deploy CloudFormation stack:
   ```bash
   aws cloudformation deploy \
     --template-file infra/cloudformation/hirehub-aws-stack.yaml \
     --stack-name hirehub-production \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides AlertEmail=ops@hirehub.careers
   ```
2. Populate `hirehub/production/app-secrets` in AWS Secrets Manager with `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, and `AWS_S3_BUCKET`.
3. Apply `infra/iam/s3-bucket-policy.json` to the created S3 documents bucket.

### Phase 2: Database Migration (Local/Existing MySQL → RDS)
1. Export existing MySQL schema and data:
   ```bash
   mysqldump -h <SOURCE_HOST> -u <USER> -p --single-transaction --routines --triggers job_portal > hirehub_dump.sql
   ```
2. Connect from an EC2 instance via SSM Session Manager (or temporary tunnel) and import into RDS:
   ```bash
   mysql -h <RDS_ENDPOINT> -u hirehub_admin -p hirehub_production < hirehub_dump.sql
   ```
3. Verify row counts across `Users`, `Companies`, `Jobs`, `Applications`, `Resumes`, `Interviews`, and `ChatHistories`.

### Phase 3: Document & Asset Migration (Local `uploads/` → S3)
1. Sync existing local documents to S3 with AES-256 encryption:
   ```bash
   aws s3 sync backend/uploads/ s3://<DOCUMENTS_BUCKET>/uploads/ --sse AES256
   ```
2. Verify pre-signed download URLs resolve via `/api/v1/resumes`.

### Phase 4: Backend Deployment on EC2 & Verification
1. Boot EC2 instances with `infra/ec2/user-data.sh` (installs Node 20, PM2, Nginx, CloudWatch Agent).
2. Verify `/api/v1/health` returns `200 OK` with `"database": "connected"` and `"storage": "s3"`.
3. Confirm CloudWatch Logs are receiving structured JSON logs in `/hirehub/production/backend`.

### Phase 5: Frontend Deployment & DNS Cutover
1. Build frontend (`npm run build` in `frontend/`) with `VITE_API_URL=https://api.yourdomain.com/api/v1`.
2. Sync `frontend/dist/` to the S3 frontend bucket and invalidate CloudFront (`/*`).
3. Switch Route 53 DNS `A` (Alias) records to CloudFront (frontend) and ALB (API).
4. **Rollback Plan:** Keep source DB & previous DNS TTL at `60s` during cutover; if 5xx alarm triggers, revert Route 53 alias or ASG Launch Template version within 60 seconds.
