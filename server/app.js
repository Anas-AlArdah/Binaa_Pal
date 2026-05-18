const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });
const db = require('./models');

// ================= Routes =================

const availabilityRoutes = require('./routes/availabilityRoutes');
const photoRoutes = require('./routes/photoRoutes');
const projectRoutes = require('./routes/projectRoutes');

const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const roleRoutes = require('./routes/roleRouter');
const requestRoutes = require('./routes/requestRouter');
const workerRequestRoutes = require('./routes/workerRequestRouter');
const workerProfileRoutes = require('./routes/workerProfileRouter');
const craftRoutes = require('./routes/craftRouter');
const offerRoutes = require('./routes/offerRouter');
const assistantRoutes = require('./routes/Assistantrouter');
const searchRoutes = require('./routes/aiSearchRouter');
const skillRoutes = require('./routes/skillRouter');
const workerSkillRoutes = require('./routes/workerskillRouter');
const reviewRoutes = require('./routes/reviewRouter');
const adminRoutes = require('./routes/adminRouter');

const app = express();
const PORT = process.env.PORT || 3001;

// ================= Middlewares =================

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ================= API Routes =================

app.use('/api/availability', availabilityRoutes);
app.use('/api/photo', photoRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/worker-request', workerRequestRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/workerskills', workerSkillRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ================= Test Route =================

app.get('/', (req, res) => {
  res.json({
    message: 'API is working',
  });
});

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

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
