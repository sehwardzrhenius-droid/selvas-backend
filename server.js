require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter      = rateLimit({ windowMs: 15*60*1000, max: 100 });
const orderLimiter = rateLimit({ windowMs: 10*60*1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/orders/place', orderLimiter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu',   require('./routes/menu'));
app.use('/api/admin',  require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, shop: process.env.SHOP_NAME, time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), status: '🟢 Running' });
});

app.get('/api/shop-status', async (req, res) => {
  try {
    const { all } = require('./db/database');
    const rows = await all('SELECT * FROM settings');
    const s = {}; rows.forEach(r => { s[r.key] = r.value; });
    const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }).slice(0,5);
    const isOpen = s.accept_orders !== '0' && now >= (s.shop_open||'05:00') && now <= (s.shop_close||'22:00');
    res.json({ success: true, isOpen, shopOpen: s.shop_open, shopClose: s.shop_close, notice: s.shop_notice||'', upiId: process.env.SHOP_UPI, deliveryCharge: s.delivery_charge||'0' });
  } catch(e) {
    res.json({ success: true, isOpen: true, upiId: process.env.SHOP_UPI, deliveryCharge: '0' });
  }
});

app.get('/admin*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Selva's Cafe & Bakes Backend Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
