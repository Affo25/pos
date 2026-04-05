require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Start server FIRST
const startServer = async () => {
  try {
    // ✅ Start server immediately
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${NODE_ENV}`);
    });

    // ✅ Connect DB in background (non-blocking)
    console.log('🔄 Connecting to MongoDB...');
    connectDB()
      .then(() => console.log('✅ MongoDB connected successfully'))
      .catch(err => console.error('❌ MongoDB connection failed:', err.message));

    return server;

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();