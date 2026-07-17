require('dotenv').config({ quiet: true });

const fileConfig = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const fallback = fileConfig[env] || fileConfig.development || {};

const envOrDefault = (key, defaultValue) =>
  Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : defaultValue;

const sslEnabled = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false';
const isProduction = env === 'production';

if (
  isProduction &&
  !process.env.DATABASE_URL &&
  !process.env.MYSQL_URL &&
  (!process.env.DB_HOST || !process.env.DB_USERNAME || !(process.env.DB_NAME || process.env.DB_DATABASE))
) {
  throw new Error(
    'Production database configuration is missing. Set DATABASE_URL/MYSQL_URL or DB_HOST, DB_USERNAME, and DB_NAME.'
  );
}

const baseConfig = {
  dialect: envOrDefault('DB_DIALECT', fallback.dialect || 'mysql'),
  username: envOrDefault('DB_USERNAME', process.env.MYSQLUSER || fallback.username),
  password: envOrDefault('DB_PASSWORD', process.env.MYSQLPASSWORD || fallback.password),
  database: envOrDefault(
    'DB_NAME',
    envOrDefault('DB_DATABASE', process.env.MYSQLDATABASE || fallback.database)
  ),
  host: envOrDefault('DB_HOST', process.env.MYSQLHOST || fallback.host),
  port: Number(envOrDefault('DB_PORT', process.env.MYSQLPORT || fallback.port || 3306)),
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

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;
  baseConfig.use_env_variable = 'DATABASE_URL';
}

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
