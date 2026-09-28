const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Short-lived access token (15 minutes).
// Payload is minimal: only user id. Frontend sends it as "Bearer <token>".
function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
}

// Long-lived refresh token (7 days).
// Only used on /refresh-token route, sent via HTTP-only cookie.
// jti (random id) ensures every token is unique even if issued in the same second,
// so rotation always invalidates the old token.
function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    jwtid: crypto.randomUUID(),
  });
}

// Hash a refresh token with SHA-256 so we never store the raw token in DB.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Cookie settings that work for local dev AND production.
// In production (HTTPS): secure=true, sameSite=none.
// In development (HTTP localhost): secure=false, sameSite=lax.
function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // JS cannot read it -> protects from XSS theft
    secure: isProd, // only send over HTTPS in production
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refresh token expiry
    path: '/',
  };
}

// Options for clearing the cookie (no maxAge — Express sets expiry itself).
function clearRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  clearRefreshCookieOptions,
};
