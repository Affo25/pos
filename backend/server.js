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

let server;

process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection:', reason);
});

// Start server FIRST (listen without fixed IPv4-only bind — works with Railway IPv4/IPv6)
const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      const addr = server.address();
      console.log(`🚀 Server listening`, addr);
      console.log(`📡 Environment: ${NODE_ENV}`);
    });

    console.log('🔄 Connecting to MongoDB...');
    connectDB()
      .then(() => console.log('✅ MongoDB connected successfully'))
      .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();