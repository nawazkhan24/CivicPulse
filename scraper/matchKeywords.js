// scraper/matchKeywords.js
// Checks if any of the user's keywords appear in the agenda text

function matchKeywords(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return [];

  const textLower = text.toLowerCase();
  const matched = [];

  keywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      matched.push(keyword);  // collect all keywords that matched
    }
  });

  return matched;  // returns array of matched keywords
}

module.exports = matchKeywords;