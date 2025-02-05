const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Import rate limiter

require('dotenv').config();
const app = express();
app.use(cors());
connectDB();

app.use(bodyParser.json());

// Rate limiting middleware for OTP requests
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many OTP requests from this IP, please try again later."
});

// Use the rate limiter on the OTP sending route
app.use('/api/auth/send-otp', otpLimiter);

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));