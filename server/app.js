const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRouter');
const roleRoutes = require('./routes/roleRouter');
const requestRoutes = require('./routes/requestRouter');
const offerRouter = require("./routes/offerRouter");
const assistantRouter = require('./routes/assistantRouter');
const searchRouter = require('./routes/aiSearchRouter');
const skillRouter = require('./routes/skillRouter');
const workerskillRouter = require('./routes/workerskillRouter');
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/requests', requestRoutes);
app.use("/offers", offerRouter);
app.use('/assistant', assistantRouter);
app.use('/search', searchRouter);
app.use('/skills', skillRouter);
app.use('/workerskills', workerskillRouter);

app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

module.exports = app;