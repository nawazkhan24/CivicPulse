// models/User.js
// This defines what a "user" looks like in your database
// Think of it like designing the columns of a spreadsheet

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true       // name is mandatory
  },
  email: {
    type: String,
    required: true,
    unique: true         // no two users can have same email
  },
  password: {
    type: String,
    required: true       // stored encrypted, never plain text
  },
  keywords: {
    type: [String],      // array of keywords e.g. ["park", "school"]
    default: []
  },
  city: {
    type: String,
    default: ''          // which city's agenda to monitor
  },
  agendaUrl: {
    type: String,
    default: ''          // the actual URL of their city's agenda page
  },
  createdAt: {
    type: Date,
    default: Date.now    // automatically saves signup time
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);