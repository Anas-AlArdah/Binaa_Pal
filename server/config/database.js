require('dotenv').config({ quiet: true });

const fileConfig = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const fallback = fileConfig[env] || fileConfig.development || {};

const envOrDefault = (key, defaultValue) =>
  Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : defaultValue;

const sslEnabled = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false';

const baseConfig = {
  dialect: envOrDefault('DB_DIALECT', fallback.dialect || 'mysql'),
  username: envOrDefault('DB_USERNAME', fallback.username),
  password: envOrDefault('DB_PASSWORD', fallback.password),
  database: envOrDefault('DB_NAME', envOrDefault('DB_DATABASE', fallback.database)),
  host: envOrDefault('DB_HOST', fallback.host),
  port: Number(envOrDefault('DB_PORT', fallback.port || 3306)),
  logging: String(process.env.SEQUELIZE_LOGGING || '').toLowerCase() === 'true' ? console.log : false,
  dialectOptions: sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized,
        },
      }
    : {},
};

if (process.env.DATABASE_URL) {
  baseConfig.use_env_variable = 'DATABASE_URL';
}

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
