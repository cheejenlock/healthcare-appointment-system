const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Token storage path (local dev)
const TOKEN_PATH = path.join(__dirname, '..', '..', '.google-token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Step 1: Generate the auth URL that the user must visit.
 */
function getAuthUrl() {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Step 2: Exchange the "code" (from callback) for tokens, save to disk.
 */
async function exchangeCode(code) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return tokens;
}

/**
 * Load saved tokens into an OAuth client.
 * Returns null if no tokens saved yet.
 */
function loadAuthorizedClient() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

function isAuthorized() {
  return fs.existsSync(TOKEN_PATH);
}

module.exports = {
  createOAuthClient,
  getAuthUrl,
  exchangeCode,
  loadAuthorizedClient,
  isAuthorized,
};