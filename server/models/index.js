'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
require('dotenv').config({ quiet: true });

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const baseConfig = require(__dirname + '/../config/config.json')[env];
const envOrDefault = (key, fallback) =>
  Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : fallback;
const config = {
  ...baseConfig,
  username: envOrDefault('DB_USERNAME', baseConfig.username),
  password: envOrDefault('DB_PASSWORD', baseConfig.password),
  database: envOrDefault('DB_NAME', envOrDefault('DB_DATABASE', baseConfig.database)),
  host: envOrDefault('DB_HOST', baseConfig.host),
  port: Number(envOrDefault('DB_PORT', baseConfig.port || 3306)),
};
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});  

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
