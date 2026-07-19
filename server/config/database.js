'use strict';

require('./env');

const connectionUrl = process.env.SUPABASE_DATABASE_URL;

if (!connectionUrl) {
  throw new Error(
    'SUPABASE_DATABASE_URL is required. Copy the Session pooler connection string from Supabase.'
  );
}

if (!/^postgres(?:ql)?:\/\//i.test(connectionUrl)) {
  throw new Error('SUPABASE_DATABASE_URL must be a PostgreSQL connection string.');
}

const config = {
  use_env_variable: 'SUPABASE_DATABASE_URL',
  dialect: 'postgres',
  logging: String(process.env.SEQUELIZE_LOGGING || '').toLowerCase() === 'true'
    ? console.log
    : false,
  dialectOptions: {
    application_name: 'binaa-pal-api',
    keepAlive: true,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  migrationStorageTableName: 'SequelizeMeta',
};

module.exports = {
  development: config,
  test: config,
  production: config,
};
