const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ Database error:', err));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/test-scrape', async (req, res) => {
  try {
    const fetchAgenda = require('./scraper/fetchAgenda');
    const extractText = require('./scraper/extractText');

    const url = req.query.url || 'https://www.gmda.gov.in';
    console.log('Testing URL:', url);

    const html = await fetchAgenda(url);

    if (!html) {
      return res.json({ success: false, message: 'Could not fetch page' });
    }

    const text = extractText(html);

    res.json({
      success: true,
      url: url,
      length: text.length,
      preview: text.substring(0, 800)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── TEST ALERT ROUTE ──
app.get('/test-alert', async (req, res) => {
  try {
    const User = require('./models/User');
    const fetchAgenda = require('./scraper/fetchAgenda');
    const extractText = require('./scraper/extractText');
    const matchKeywords = require('./scraper/matchKeywords');
    const sendAlert = require('./mailer/sendAlert');

    const users = await User.find({});

    if (users.length === 0) {
      return res.json({ 
        message: '⚠️ No users found. Please register first at http://localhost:3000' 
      });
    }

    const results = [];

    for (const user of users) {
      if (!user.agendaUrl) {
        results.push(`⚠️ No agenda URL for ${user.email}`);
        continue;
      }

      console.log(`Checking user: ${user.email}`);
      console.log(`Their keywords: ${user.keywords}`);
      console.log(`Their city URL: ${user.agendaUrl}`);

      // Fetch real page using Puppeteer
      const html = await fetchAgenda(user.agendaUrl);
      const text = extractText(html);

      console.log(`Scraped text length: ${text.length}`);
      console.log(`Text preview: ${text.substring(0, 200)}`);

      const matched = matchKeywords(text, user.keywords);
      console.log(`Matched keywords: ${matched}`);

      if (matched.length > 0) {
        await sendAlert(
          user.email,
          user.name,
          matched,
          user.agendaUrl,
          user.city
        );
        results.push(`✅ Email sent to ${user.email} — matched: ${matched.join(', ')}`);
      } else {
        results.push(`ℹ️ No match for ${user.email} — their keywords: ${user.keywords.join(', ')} — scraped ${text.length} characters`);
      }
    }

    res.json({ results });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scheduler
require('./scheduler/cronJob');

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔍 Test scrape: http://localhost:${PORT}/test-scrape`);
  console.log(`📧 Test alert: http://localhost:${PORT}/test-alert`);
});