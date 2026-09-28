const { validationResult } = require('express-validator');

// Runs AFTER the validator arrays.
// If validation failed, return 400 BEFORE controller logic runs.
// Frontend gets field-level errors: [{ field, message }]
function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));
  return res.status(400).json({ message: 'Validation failed', errors });
}

module.exports = validateRequest;
