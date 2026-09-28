// Vercel entry point. The root vercel.json rewrites /api/* to the backend
// service, and every request lands here (catch-all under /api) where the
// Express app takes over with its own /api/... routes.
const app = require('../server');

module.exports = app;
