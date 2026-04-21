// server.js - Main Server for Selva's Cafe & Bakes Backend

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app = express();

// ── SECURITY & MIDDLEWARE ─────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' });
const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: 'Too many orders placed. Please wait.' });
app.use('/api/', limiter);
app.use('/api/orders/place', orderLimiter);

// ── SERVE ADMIN PANEL ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES ───────────────────────────────────────────────────
const ordersRouter = require('./routes/orders');
const menuRouter   = require('./routes/menu');
const adminRouter  = require('./routes/admin');

app.use('/api/orders', ordersRouter);
app.use('/api/menu',   menuRouter);
app.use('/api/admin',  adminRouter);

// ── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    shop: process.env.SHOP_NAME,
    address: process.env.SHOP_ADDRESS,
    time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: '🟢 Server Running',
  });
});

// ── SHOP STATUS (Public) ─────────────────────────────────────────
app.get('/api/shop-status', (req, res) => {
  const { db } = require('./db/database');
  const settings = {};
  db.prepare('SELECT * FROM settings').all().forEach(r => { settings[r.key] = r.value; });
  const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }).slice(0,5);
  const isOpen = settings.accept_orders !== '0' && now >= (settings.shop_open || '05:00') && now <= (settings.shop_close || '22:00');
  res.json({
    success: true,
    isOpen,
    shopOpen: settings.shop_open,
    shopClose: settings.shop_close,
    notice: settings.shop_notice || '',
    upiId: process.env.SHOP_UPI,
    deliveryCharge: settings.delivery_charge || '0',
    minOrder: settings.min_order || '50',
  });
});

// ── CATCH ALL → Serve Admin Panel ────────────────────────────────
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// ── ERROR HANDLER ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── START SERVER ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Selva's Cafe & Bakes Backend Running!`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🕐 Shop Hours: ${process.env.SHOP_OPEN} – ${process.env.SHOP_CLOSE}\n`);
});

module.exports = app;
