const User = require('../models/User');

// Only sellers may manage inventory (create/edit/delete products).
// Runs AFTER authenticate, so req.user.id is trusted.
// Reads the live role from DB (works even for tokens issued before roles).
async function requireSeller(req, res, next) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can manage products' });
  }
  return next();
}

module.exports = requireSeller;
