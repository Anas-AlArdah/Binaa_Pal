const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const roleRoutes = require('./routes/roleRouter');
const requestRoutes = require('./routes/requestRouter');
const workerProfileRoutes = require('./routes/workerProfileRouter');
const craftRoutes = require('./routes/craftRouter');
const offerRoutes = require('./routes/offerRouter');
const assistantRoutes = require('./routes/Assistantrouter');
const searchRoutes = require('./routes/aiSearchRouter');
const skillRoutes = require('./routes/skillRouter');
const workerSkillRoutes = require('./routes/workerskillRouter');
const adminRoutes = require('./routes/adminRouter');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

//Unified API namespace used by the current frontend.
app.use('/api/auth', authRoutes);
console.log("users route loaded");
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/worker-profiles', workerProfileRoutes);
app.use('/api/crafts', craftRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/workerskills', workerSkillRoutes);
app.use('/api/admin', adminRoutes);

//Legacy aliases kept so older team work still runs on the same backend.
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/requests', requestRoutes);
app.use('/worker-profiles', workerProfileRoutes);
app.use('/crafts', craftRoutes);
app.use('/offers', offerRoutes);
app.use('/assistant', assistantRoutes);
app.use('/search', searchRoutes);
app.use('/skills', skillRoutes);
app.use('/workerskills', workerSkillRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is working 🚀');
});

async function startServer() {
  await db.sequelize.authenticate();
  console.log('Connected to MySQL via Sequelize');

  return app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };
