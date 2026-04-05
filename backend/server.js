const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Load routes synchronously — must run before listen so /api/* is never missing on Railway.
const app = require('./src/app');
const connectDB = require('./src/config/db');

const rawPort = process.env.PORT || '5000';
const PORT = Number.parseInt(rawPort, 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!Number.isFinite(PORT) || PORT < 1) {
  console.error('❌ Invalid PORT:', process.env.PORT);
  process.exit(1);
}

process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Listening', server.address());
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log('✅ Routes: GET /health, GET /api/ping, POST /api/users/login, …');
});

// DB after listen — avoids delaying HTTP server; routes still return 401/500 if DB down, not 404.
console.log('🔄 Connecting to MongoDB…');
connectDB()
  .then(() => console.log('✅ MongoDB ready'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
