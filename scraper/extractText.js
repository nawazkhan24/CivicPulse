// scraper/extractText.js
// Takes raw HTML and pulls out readable text from it

const cheerio = require('cheerio');

function extractText(html) {
  if (!html) return '';

  // Load HTML into cheerio (like opening it in a browser)
  const $ = cheerio.load(html);

  // Remove things we don't need
  $('script').remove();   // remove JavaScript code
  $('style').remove();    // remove CSS styling
  $('nav').remove();      // remove navigation menus
  $('footer').remove();   // remove footers

  // Get all the visible text from the page
  const text = $('body').text();

  // Clean up extra spaces and blank lines
  const cleanText = text
    .replace(/\s+/g, ' ')   // replace multiple spaces with one
    .trim();

  return cleanText;
}

module.exports = extractText;