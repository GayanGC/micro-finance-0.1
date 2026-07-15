require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const startCronJobs = require('./utils/cronJobs');

// ─── Route imports ────────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const customerRoutes     = require('./routes/customerRoutes');
const loanRoutes         = require('./routes/loanRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const reportRoutes       = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const employeeRoutes     = require('./routes/employeeRoutes');
const attendanceRoutes   = require('./routes/attendanceRoutes');
const leaveRoutes        = require('./routes/leaveRoutes');
const policyRoutes       = require('./routes/policyRoutes');

/**
 * Bootstrap — connect to MongoDB Atlas first, then start Express.
 * The server will NOT start if the DB connection fails (process.exit in db.js).
 */
const bootstrap = async () => {
  // ── 1. Connect to MongoDB Atlas (Cluster0) ─────────────────────────────
  await connectDB();

  // ── 2. Create Express app ──────────────────────────────────────────────
  const app = express();

  // ── 3. Security middleware ─────────────────────────────────────────────
  app.use(helmet());

  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // ── 4. Body parsing ────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── 5. Health check (useful for Electron/pkg EXE ping) ─────────────────
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'MicroFinance API is running',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    });
  });

  // ── 6. API Routes (mounted only after successful DB connection) ─────────
  app.use('/api/auth',          authRoutes);
  app.use('/api/users',         userRoutes);
  app.use('/api/customers',     customerRoutes);
  app.use('/api/loans',         loanRoutes);
  app.use('/api/payments',      paymentRoutes);
  app.use('/api/reports',       reportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/employees',     employeeRoutes);
  app.use('/api/attendance',    attendanceRoutes);
  app.use('/api/leaves',        leaveRoutes);
  app.use('/api/policies',      policyRoutes);

  // ── 7. 404 handler ─────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    });
  });

  // ── 8. Centralized error handler (must be last middleware) ─────────────
  app.use(errorHandler);

  // ── 9. Start HTTP server ───────────────────────────────────────────────
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`\n🚀  MicroFinance API server running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Frontend    : ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
    console.log(`   Health      : http://localhost:${PORT}/api/health\n`);

    // Start scheduled cron jobs after server is up
    startCronJobs();
  });

  // ── 10. Graceful shutdown handlers ────────────────────────────────────
  process.on('unhandledRejection', (err) => {
    console.error('💥  Unhandled Promise Rejection:', err.message);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('💥  Uncaught Exception:', err.message);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('📴  SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('✅  Server closed');
      process.exit(0);
    });
  });

  return app;
};

// Run bootstrap
bootstrap().catch((err) => {
  console.error('💀  Fatal startup error:', err.message);
  process.exit(1);
});
