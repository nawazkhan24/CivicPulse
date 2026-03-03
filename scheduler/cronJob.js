// scheduler/cronJob.js
// This runs the scraper automatically every day at 9am

const cron = require('node-cron');
const User = require('../models/User');
const fetchAgenda = require('../scraper/fetchAgenda');
const extractText = require('../scraper/extractText');
const matchKeywords = require('../scraper/matchKeywords');
const sendAlert = require('../mailer/sendAlert');

// '0 9 * * *' means "run at 9:00 AM every day"
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running daily agenda check...');

  try {
    // Get all registered users from database
    const users = await User.find({});

    for (const user of users) {
      if (!user.agendaUrl) continue;  // skip users with no URL

      // Step 1: fetch the page
      const html = await fetchAgenda(user.agendaUrl);

      // Step 2: extract readable text
      const text = extractText(html);

      // Step 3: check their keywords
      const matched = matchKeywords(text, user.keywords);

      // Step 4: email them if something matched
      if (matched.length > 0) {
        await sendAlert(user.email, user.name, matched, user.agendaUrl, user.city);
      } else {
        console.log(`ℹ️ No matches for ${user.email} today`);
      }
    }

    console.log('✅ Daily check complete');

  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  }
});