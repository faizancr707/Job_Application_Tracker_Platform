/**
 * @file ai.config.js
 * @description Central AI configuration
 */

const { z } = require('zod');

// Schema for environment variables
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OpenAI API Key is required"),
  JWT_SECRET: z.string().min(1, "JWT Secret is required"),
  DATABASE_NAME: z.string().min(1, "Database Name is required"),
  DATABASE_USER: z.string().min(1, "Database User is required"),
  DATABASE_PASSWORD: z.string().min(1, "Database Password is required"),
  DATABASE_HOST: z.string().min(1, "Database Host is required"),
  REDIS_URL: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().optional(),
});

// Validate env vars. In a real app we might not want to crash on load if env vars are missing during build, but for backend it's usually fine.
let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.warn("Environment variable validation failed:", err.message);
  // Fallback to process.env for missing variables
  env = process.env;
}

const config = {
  env,
  models: {
    primary: 'gpt-4o',
    fast: 'gpt-4o-mini',
    embedding: 'text-embedding-3-small'
  },
  modelDefaults: {
    temperature: 0.3,
    maxTokens: 4096,
  },
  rateLimits: {
    ai: { points: 10, duration: 60 }, // 10 req/min
    embeddings: { points: 30, duration: 60 }, // 30 req/min
    general: { points: 100, duration: 60 }, // 100 req/min
  },
  cost: {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'text-embedding-3-small': { input: 0.02, output: 0.00 }
  },
  features: {
    useRedis: !!env.REDIS_URL,
    useS3: !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET && env.AWS_REGION)
  }
};

module.exports = config;
