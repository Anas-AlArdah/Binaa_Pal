'use strict';

const db = require('./models');

async function connectDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to MySQL');
  } catch (error) {
    console.error('DB Error:', error);
    process.exitCode = 1;
  }
}

connectDatabase();

module.exports = db;
