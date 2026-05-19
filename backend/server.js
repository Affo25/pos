const path = require('path');

function loadEnv() {
  const root = __dirname;
  require('dotenv').config({ path: path.join(root, '.env') });
  // Fallback: some setups only edit .env.txt — load it if SMTP is still missing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    require('dotenv').config({ path: path.join(root, '.env.txt') });
  }
}

loadEnv();

try {
  const { getEmailStatus } = require('./src/services/emailService');
  const emailStatus = getEmailStatus();
  if (emailStatus.provider === 'resend' && emailStatus.resendConfigured) {
    console.log('✅ Email: Resend API');
  } else if (emailStatus.smtpConfigured) {
    console.log(`✅ Email: SMTP (${process.env.SMTP_HOST || 'configured'})`);
  } else if (emailStatus.resendConfigured) {
    console.log('✅ Email: Resend API (auto)');
  } else {
    console.warn(
      '⚠️ Email not configured — set RESEND_API_KEY (resend.com) or SMTP_USER/SMTP_PASS in backend/.env',
    );
  }
} catch (e) {
  console.warn('⚠️ Email status check skipped:', e.message);
}

try {
  const { isWhatsAppConfigured, getMessageMode } = require('./src/services/whatsappService');
  if (isWhatsAppConfigured()) {
    console.log(`✅ WhatsApp Cloud API (${getMessageMode()} mode)`);
  } else {
    console.warn(
      '⚠️ WhatsApp not configured — set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in backend/.env',
    );
  }
} catch (e) {
  console.warn('⚠️ WhatsApp status check skipped:', e.message);
}

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
