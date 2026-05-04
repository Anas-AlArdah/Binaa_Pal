const express = require('express');
const app = express();


const db = require('./models');

app.use(express.json());

const userRoutes = require('./routes/userRouter');
const roleRoutes = require('./routes/roleRouter');
const requestRoutes = require('./routes/requestRouter');
const offerRouter = require("./routes/offerRouter");

app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/requests', requestRoutes);
app.use("/offers", offerRouter);
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
})