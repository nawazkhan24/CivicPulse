// routes/dashboard.js
// Handles the user dashboard — shows their settings and keywords

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware — checks if user is logged in
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// GET dashboard — returns user info
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT — update keywords
router.put('/keywords', verifyToken, async (req, res) => {
  try {
    const { keywords } = req.body;
    await User.findByIdAndUpdate(req.userId, {
      keywords: keywords.split(',').map(k => k.trim().toLowerCase())
    });
    res.json({ message: '✅ Keywords updated!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;