const { Sequelize } = require('sequelize');

/**
 * Enterprise Database Connection Layer
 * Supports AWS RDS PostgreSQL, AWS RDS MySQL, and local database instances.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
const DATABASE_PORT = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined;
const DATABASE_DIALECT = (process.env.DATABASE_DIALECT || 'mysql').toLowerCase();
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';

let sequelize;

const baseOptions = {
  logging: false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: 30000,
    idle: 10000,
  },
};

// Configure SSL for AWS RDS if enabled
if (DATABASE_SSL) {
  baseOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

if (DATABASE_URL) {
  // Connection via AWS RDS / Cloud Database URL
  console.log('[Database] Connecting via DATABASE_URL string...');
  sequelize = new Sequelize(DATABASE_URL, {
    ...baseOptions,
    dialect: DATABASE_DIALECT,
  });
} else {
  if (!DATABASE_NAME || !DATABASE_USER) {
    console.warn(
      '⚠️ Missing standard database environment variables (DATABASE_NAME, DATABASE_USER, DATABASE_HOST).\n' +
      '   Ensure variables are set in your .env or AWS Parameter Store/Secrets Manager.'
    );
  }

  sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
    host: DATABASE_HOST,
    port: DATABASE_PORT || (DATABASE_DIALECT === 'postgres' ? 5432 : 3306),
    dialect: DATABASE_DIALECT,
    ...baseOptions,
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ [Database] ${DATABASE_DIALECT.toUpperCase()} connected successfully (${DATABASE_HOST})`);
    await sequelize.sync({ alter: true });
    console.log('✅ [Database] All Sequelize models synchronized');
  } catch (error) {
    console.error(`❌ [Database] Connection failed:`, error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
};
