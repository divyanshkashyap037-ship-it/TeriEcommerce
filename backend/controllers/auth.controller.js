const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  clearRefreshCookieOptions,
} = require('../utils/token');

// POST /api/auth/register — public
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // 409 if email already taken
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // bcrypt hash with 10+ salt rounds. Never store plaintext.
    const hashedPassword = await bcrypt.hash(password, 10);
    // role was validated (buyer/seller) — schema defaults to buyer.
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
    });

    // Return user WITHOUT password / refreshToken, and NO tokens here.
    return res.status(201).json({
      message: 'User registered successfully',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/login — public
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // +password because User schema does not select it? (password is selected
    // by default here, but explicit is safe). We need hash to compare.
    const user = await User.findOne({ email }).select('+password +refreshToken');
    // Generic message: do not reveal if email or password was wrong.
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store HASH of refresh token for revocation checking.
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    // Refresh token goes in HTTP-only cookie (JS cannot read it).
    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    // Access token goes in JSON (frontend keeps it in memory).
    return res.json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/refresh-token — reads cookie, rotates tokens
async function refreshTokenHandler(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    let decoded;
    try {
      // Must verify with REFRESH secret (not access secret).
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    // Token must match the stored hash in MongoDB (revocation check).
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken || user.refreshToken !== hashToken(token)) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(403).json({ message: 'Refresh token revoked' });
    }

    // Rotation: old refresh token becomes invalid, issue new pair.
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions());
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return next(err);
  }
}

// POST /api/auth/logout
// Design decision: logout is driven by the refresh cookie, NOT the access
// token. Why? Logout should work even if the short-lived access token already
// expired. We find the user by the stored refresh-token hash and delete it.
async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: hashToken(token) }).select(
        '+refreshToken'
      );
      if (user) {
        user.refreshToken = null; // revoke
        await user.save();
      }
    }
    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return next(err);
  }
}

// GET /api/auth/me — protected, needs authenticate middleware
async function me(req, res, next) {
  try {
    // req.user.id was set by authenticate middleware. Never trust an id
    // sent from frontend body/params for identity.
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refreshTokenHandler, logout, me };
