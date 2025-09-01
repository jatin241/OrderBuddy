const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const connectionsRoutes = require("./routes/connectionsRoutes");

const app = express();

// ✅ Configure CORS
const allowedOrigins = [
    "https://order-buddy-pz7i.vercel.app", // Your Vercel frontend URL
    "http://localhost:5173" // For local development
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, false);
        if (allowedOrigins.includes(origin)) {
            return callback(null, origin); // Echo back the allowed origin
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/connections", connectionsRoutes);

// filepath: d:\webdev\fullStack\orderbuddy\backend\server.js
app.get('/api/protected', (req, res) => {
  res.json({ message: "This is a protected route!" });
});

app.get('/', (req, res) => {
    res.send('OrderBuddy API is running...');
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.error(err));
