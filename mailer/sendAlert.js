// mailer/sendAlert.js
// Sends an email to the user when their keywords are found

const nodemailer = require('nodemailer');

// Set up email sender using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // use Gmail App Password, not your real password
  }
});

async function sendAlert(userEmail, userName, matchedKeywords, agendaUrl, city) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔔 Agenda Alert: Your keywords were found in ${city}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">📋 Agenda Monitor Alert</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We found the following topics you care about in the latest city agenda for <strong>${city}</strong>:</p>
          
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${matchedKeywords.map(k => `<span style="background:#3498db; color:white; padding:5px 10px; border-radius:20px; margin:4px; display:inline-block;">✅ ${k}</span>`).join('')}
          </div>

          <p>View the full agenda here:</p>
          <a href="${agendaUrl}" style="background:#2ecc71; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
            View Agenda
          </a>

          <p style="margin-top:30px; color:#999; font-size:12px;">
            You received this because you subscribed to Agenda Monitor.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Alert sent to ${userEmail}`);

  } catch (error) {
    console.error(`❌ Failed to send email to ${userEmail}:`, error.message);
  }
}

module.exports = sendAlert;