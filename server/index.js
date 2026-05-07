'use strict';

const { app, startServer } = require('./app');

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
}

module.exports = app;
