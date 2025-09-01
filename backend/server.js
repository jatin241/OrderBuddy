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
    "https://order-buddy-pz7i.vercel.app", // Vercel frontend
    "http://localhost:5173"                // Local dev
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);   // ✅ allow
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/connections", connectionsRoutes);

app.get('/api/protected', (req, res) => {
  res.json({ message: "This is a protected route!" });
});

app.get('/', (req, res) => {
    res.send('OrderBuddy API is running...');
});

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error(err));
