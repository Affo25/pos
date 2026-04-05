const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const rawPort = process.env.PORT || '5000';
const PORT = Number.parseInt(rawPort, 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!Number.isFinite(PORT) || PORT < 1) {
  console.error('❌ Invalid PORT:', process.env.PORT);
  process.exit(1);
}

// Global unhandled rejection handler
process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection:', reason);
});

// --- Connect to MongoDB first ---
const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Start server only after DB connection
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📡 Environment: ${NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server due to DB error:', err.message);
    process.exit(1);
  }
};

startServer();