const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();
app.set('trust proxy', 1);

// Register liveness routes before heavy imports so the port can accept /health immediately (Railway).
const sendHealth = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
};
app.get('/health', sendHealth);
app.head('/health', (req, res) => res.status(200).end());
app.get('/api/health', sendHealth);
app.get('/', (req, res) => {
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Listening', server.address());
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log('✅ Health: GET/HEAD /health, GET /api/health');
});

try {
  require('./src/routesSetup')(app);
  console.log('✅ API routes mounted');
} catch (err) {
  console.error('❌ Failed to mount API routes:', err);
  process.exit(1);
}

const connectDB = require('./src/config/db');
console.log('🔄 Connecting to MongoDB…');
connectDB()
  .then(() => console.log('✅ MongoDB ready'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
