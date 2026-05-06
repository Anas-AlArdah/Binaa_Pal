'use strict';

const express = require('express');
const cors = require('cors');
const db = require('./models');
const userRouter = require('./routes/userRouter');
const roleRouter = require('./routes/roleRouter');
const requestRouter = require('./routes/requestRouter');
const workerProfileRouter = require('./routes/workerProfileRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/requests', requestRouter);
app.use('/api/worker-profiles', workerProfileRouter);

// Database Connection & Server Start
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Connected to MySQL via Sequelize');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

startServer();

module.exports = app;

