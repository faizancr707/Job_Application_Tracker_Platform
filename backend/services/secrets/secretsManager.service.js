/**
 * AWS Secrets Manager Bootstrap Service
 * Fetches production secrets (RDS credentials, JWT secret, OpenAI API key)
 * using the EC2 IAM Instance Profile (IMDSv2) or configured AWS credentials.
 * Falls back transparently to local .env variables when AWS_SECRET_NAME is unset.
 */

let SecretsManagerClient = null;
let GetSecretValueCommand = null;

try {
  const smSdk = require('@aws-sdk/client-secrets-manager');
  SecretsManagerClient = smSdk.SecretsManagerClient;
  GetSecretValueCommand = smSdk.GetSecretValueCommand;
} catch (_) {
  // Optional in local development if @aws-sdk/client-secrets-manager is not installed
}

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

function createSecretsClient() {
  if (!SecretsManagerClient) return null;

  const clientConfig = { region: AWS_REGION };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  // When static keys are omitted on EC2, AWS SDK v3 automatically uses the IAM Instance Profile (IMDSv2)
  return new SecretsManagerClient(clientConfig);
}

async function fetchSecretJson(client, secretId) {
  const command = new GetSecretValueCommand({ SecretId: secretId });
  const response = await client.send(command);
  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }
  if (response.SecretBinary) {
    const buff = Buffer.from(response.SecretBinary, 'base64');
    return JSON.parse(buff.toString('utf-8'));
  }
  return {};
}

/**
 * Load application & RDS secrets from AWS Secrets Manager into process.env.
 * Safe no-op in local development when AWS_SECRET_NAME / AWS_RDS_SECRET_NAME are not set.
 */
async function loadSecrets() {
  const appSecretName = process.env.AWS_SECRET_NAME;
  const rdsSecretName = process.env.AWS_RDS_SECRET_NAME;

  if (!appSecretName && !rdsSecretName) {
    return { loaded: false, source: 'env' };
  }

  if (!SecretsManagerClient || !GetSecretValueCommand) {
    console.warn('[SecretsManager] AWS_SECRET_NAME is set, but @aws-sdk/client-secrets-manager is not installed. Using .env.');
    return { loaded: false, source: 'env-fallback' };
  }

  const client = createSecretsClient();
  let loadedCount = 0;

  // 1. Load Application Secrets (JWT_SECRET, OPENAI_API_KEY, REDIS_URL, etc.)
  if (appSecretName) {
    try {
      const secrets = await fetchSecretJson(client, appSecretName);
      for (const [key, value] of Object.entries(secrets)) {
        if (value !== undefined && value !== null && !process.env[key]) {
          process.env[key] = String(value);
          loadedCount++;
        }
      }
      console.log(`[SecretsManager] Loaded ${loadedCount} application secrets from ${appSecretName}`);
    } catch (err) {
      console.error(`[SecretsManager] Failed to load app secret "${appSecretName}":`, err.message);
      throw err;
    }
  }

  // 2. Load Auto-Rotated RDS Credentials (standard AWS RDS secret format)
  if (rdsSecretName) {
    try {
      const rdsSecret = await fetchSecretJson(client, rdsSecretName);
      if (rdsSecret.username) process.env.DATABASE_USER = rdsSecret.username;
      if (rdsSecret.password) process.env.DATABASE_PASSWORD = rdsSecret.password;
      if (rdsSecret.host) process.env.DATABASE_HOST = rdsSecret.host;
      if (rdsSecret.port) process.env.DATABASE_PORT = String(rdsSecret.port);
      if (rdsSecret.dbname) process.env.DATABASE_NAME = rdsSecret.dbname;
      console.log(`[SecretsManager] Loaded RDS credentials from ${rdsSecretName}`);
    } catch (err) {
      console.error(`[SecretsManager] Failed to load RDS secret "${rdsSecretName}":`, err.message);
      throw err;
    }
  }

  return { loaded: true, source: 'aws-secrets-manager', loadedCount };
}

module.exports = { loadSecrets };
