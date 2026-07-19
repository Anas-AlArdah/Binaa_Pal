const express = require('express');
const cors = require('cors');
require('./config/env');
const db = require('./models');

// ================= Routes =================

const availabilityRoutes = require('./routes/availabilityRoutes');
const photoRoutes = require('./routes/photoRoutes');
const projectRoutes = require('./routes/projectRoutes');

const authRoutes = require('./routes/authRouter');
const workerRequestRoutes = require('./routes/workerRequestRouter');
const workerProfileRoutes = require('./routes/workerProfileRouter');
const craftRoutes = require('./routes/craftRouter');
const searchRoutes = require('./routes/searchRouter');
const skillRoutes = require('./routes/skillRouter');
const reviewRoutes = require('./routes/reviewRouter');
const adminRoutes = require('./routes/adminRouter');

const app = express();
const PORT = process.env.PORT || 3001;

// ================= Middlewares =================

const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'binaa-pal-api',
  });
});

// ================= API Routes =================

app.use('/api/availability', availabilityRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/worker-request', workerRequestRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ================= Error Responses =================

app.use('/api', (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;

  console.error('Unhandled server error:', err);

  return res.status(status).json({
    message: status === 500 ? 'Server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && err.message ? { error: err.message } : {}),
  });
});

// ================= Start Server =================

async function startServer() {
  await db.sequelize.authenticate();
  console.log('Connected to Database via Sequelize');

  return app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { app, startServer };
