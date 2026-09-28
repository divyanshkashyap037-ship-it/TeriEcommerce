const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, refreshTokenHandler, logout, me } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validateRequest = require('../middleware/validation.middleware');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

// Simple brute-force protection on login: max 10 attempts / 15 min per IP.
// Understandable and easy to explain in review.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
});

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginLimiter, loginValidator, validateRequest, login);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logout); // cookie-based (works even if access token expired)
router.get('/me', authenticate, me);

module.exports = router;
