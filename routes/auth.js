// routes/auth.js
const cities = require('../config/cities');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// -------- CITIES --------
router.get('/cities', (req, res) => {
  res.json(cities);
});

// -------- REGISTER --------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, keywords, city, agendaUrl } = req.body;

    // ── Validations ──

    // Name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Please enter your full name' });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Password length
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // City
    if (!city) {
      return res.status(400).json({ message: 'Please select your city' });
    }

    // Keywords
    if (!keywords || keywords.trim().length === 0) {
      return res.status(400).json({ message: 'Please enter at least one keyword' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      keywords: keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0),
      city,
      agendaUrl
    });

    await user.save();
    res.status(201).json({ message: 'Registered successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// -------- LOGIN --------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validations
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        keywords: user.keywords,
        city: user.city
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;