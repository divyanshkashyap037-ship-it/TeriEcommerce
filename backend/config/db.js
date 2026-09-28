const mongoose = require('mongoose');

// Connect to MongoDB using the URI from .env
// Kept in a separate file so server.js stays clean.
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is missing in .env file');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
