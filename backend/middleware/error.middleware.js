// Central error handler. Must be registered LAST in server.js.
// Keeps all error responses in the same shape: { message }.
// Never leaks stack traces in production.
function errorHandler(err, req, res, next) {
  // Mongoose: bad ObjectId format (e.g. /products/123)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', errors: [] });
  }
  // JWT problems
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  console.error(err); // server log only, never sent to client
  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';
  return res.status(status).json({ message });
}

module.exports = errorHandler;
