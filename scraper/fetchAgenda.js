// scraper/fetchAgenda.js
const puppeteer = require('puppeteer');

async function fetchAgenda(url) {
  let browser = null;

  try {
    console.log(`🔍 Opening browser for: ${url}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Pretend to be a real Chrome browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    );

    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    });

    // Visit the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait an extra 2 seconds for JavaScript to finish loading
    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    console.log(`✅ Page loaded — ${html.length} characters`);
    return html;

  } catch (error) {
    console.error(`❌ Browser error for ${url}:`, error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = fetchAgenda;