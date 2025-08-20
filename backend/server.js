const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const connectionsRoutes = require("./routes/connectionsRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/connections", connectionsRoutes);

app.get('/', (req, res) => {
    res.send('OrderBuddy API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.error(err));
