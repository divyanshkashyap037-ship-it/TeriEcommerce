require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Render runs behind a proxy. Trust it so secure cookies + IPs work correctly.
app.set('trust proxy', 1);

// CORS must allow the frontend origin AND credentials (cookies).
// CLIENT_URL=http://localhost:5173 in .env for local dev.
// Trailing slash is stripped: browsers send Origin without one, and the
// comparison must match exactly.
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

// Dev (`node server.js` / `npm run dev`): connect, then listen on PORT.
// Vercel (serverless): this file is imported by api/[[...slug]].js and the
// app itself is exported — no port is bound and a failed DB connect must not
// kill the process.
connectDB()
  .then(() => {
    if (require.main === module) {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    if (require.main === module) process.exit(1);
  });

module.exports = app;
