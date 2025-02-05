const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
const User = require('../models/User');
require('dotenv').config(); // Ensure this is loaded at the top

const router = express.Router();

// Generate OTP
function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

// Send OTP Email
async function sendOtpEmail(email, otp) {
    console.log(`Sending OTP ${otp} to ${email}`);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Use true for SSL (port 465), false for TLS (port 587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Verify your email',
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}

// Send OTP
router.post('/send-otp', async (req, res) => {
    console.log('Received request to send OTP:', req.body);
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        // Delete existing OTP if it exists
        await OTP.deleteOne({ email });

        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        await OTP.create({ email, otpHash });

        await sendOtpEmail(email, otp);

        res.json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const record = await OTP.findOne({ email });
        if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid OTP' });

        await OTP.deleteOne({ email }); // Delete OTP after verification

        res.json({ message: 'OTP verified successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }
});

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'User registered successfully!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

module.exports = router;
