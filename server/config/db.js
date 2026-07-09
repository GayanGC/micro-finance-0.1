const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas — Cluster0
 *
 * Connection string is read exclusively from MONGO_URI env var.
 * No hardcoded credentials anywhere. Swap .env only to change environments.
 *
 * Uses Stable API v1 (serverApi) as recommended by MongoDB Atlas.
 * Routes are mounted only after this resolves successfully.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });

    // Confirm connection with a ping — mirrors the official Atlas connection test
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅  MongoDB connected successfully (Cluster0 · microfinance)');

  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1); // hard exit — do not start server without DB
  }
};

module.exports = connectDB;
