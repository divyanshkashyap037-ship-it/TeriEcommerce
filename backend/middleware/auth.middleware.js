const jwt = require('jsonwebtoken');

// What is middleware? A function that runs before the controller.
// This one protects routes: it checks "Authorization: Bearer <token>".
// "Bearer" just means "the holder of this token is authorized".
// On success it sets req.user = { id } so controllers know WHO is calling.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';

  // Expect exactly "Bearer <token>"
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing' });
  }
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    // Verify with ACCESS secret only. A refresh token will FAIL here,
    // which is intentional: never accept refresh token as access token.
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

module.exports = authenticate;
