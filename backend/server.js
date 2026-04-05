const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const root = express();
root.set('trust proxy', 1);

// Registered before any heavy imports — Railway can probe /health as soon as the port is open
root.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
root.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).type('text/plain').send('ok');
});

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

// Bind to all IPv4 interfaces (Railway internal checks use this)
const server = root.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Listening`, server.address());
  console.log(`📡 Environment: ${NODE_ENV}`);

  try {
    const apiApp = require('./src/app');
    root.use(apiApp);
    console.log('✅ API routes mounted');
  } catch (err) {
    console.error('❌ Failed to mount API (health still works):', err);
  }

  const connectDB = require('./src/config/db');
  console.log('🔄 Connecting to MongoDB...');
  connectDB()
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
});
