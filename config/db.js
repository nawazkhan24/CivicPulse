// config/db.js
// Handles database connection separately so it's clean and reusable

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;