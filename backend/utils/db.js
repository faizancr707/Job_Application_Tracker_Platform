const { Sequelize } = require('sequelize');

// dotenv is loaded by the entry point (index.js) before this module is required,
// so process.env.DATABASE_* values are already populated.

const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_HOST = process.env.DATABASE_HOST;

if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_HOST) {
  console.error(
    '❌ Missing required database environment variables (DATABASE_NAME, DATABASE_USER, DATABASE_HOST).\n' +
    '   Make sure you have a .env file in the backend directory.'
  );
}

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
  host: DATABASE_HOST,
  dialect: 'mysql',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ All models synced');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    // Re-throw so the caller (index.js) can handle the failure
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
};
