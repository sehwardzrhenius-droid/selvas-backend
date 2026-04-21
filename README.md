# ☕ Selva's Cafe & Bakes — Complete Backend

Full Node.js + Express backend for Selva's Cafe & Bakes, Vilathikulam.

---

## 📁 Project Structure

```
selvas-cafe-backend/
├── server.js                  ← Main Express server
├── package.json
├── .env                       ← Your credentials (KEEP PRIVATE)
├── railway.json               ← Deploy to Railway.app
├── selvas_cafe.db             ← SQLite database (auto-created)
├── routes/
│   ├── orders.js              ← Order API
│   ├── menu.js                ← Menu API
│   └── admin.js               ← Admin API
├── db/
│   └── database.js            ← DB setup + seed data
├── notifications/
│   ├── email.js               ← Gmail notifications
│   └── whatsapp.js            ← Twilio WhatsApp + SMS
├── middleware/
│   └── auth.js                ← JWT admin auth
└── public/
    └── admin/
        └── index.html         ← Full Admin Dashboard UI
```

---

## 🚀 STEP 1: Install & Run Locally

```bash
# 1. Enter the project folder
cd selvas-cafe-backend

# 2. Install all packages
npm install

# 3. Start the server
npm start

# Server runs at: http://localhost:3001
# Admin panel at: http://localhost:3001/admin
```

---

## 📧 STEP 2: Enable Gmail Notifications

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** → **2-Step Verification** → Turn ON
3. Then click **App Passwords** (at the bottom)
4. Select App: **Mail** | Device: **Other** → type "Selvas Cafe"
5. Copy the 16-character password
6. Open `.env` and set:
   ```
   EMAIL_PASS=abcd efgh ijkl mnop
   ```
   (paste the 16-character app password, remove spaces)

---

## 📱 STEP 3: Enable WhatsApp & SMS (Twilio)

### Get Twilio Account (FREE trial):
1. Sign up at: https://www.twilio.com/try-twilio
2. Verify your phone number (+91 8438837809)
3. Go to **Console Dashboard** and copy:
   - Account SID
   - Auth Token
4. Get a free Twilio phone number

### Enable WhatsApp Sandbox:
1. Go to: Twilio Console → Messaging → Try it Out → Send a WhatsApp Message
2. Send the join code from your phone (+91 8438837809) to the sandbox number
3. Now WhatsApp alerts will work!

### Update .env:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE=+1xxxxxxxxxx
```

---

## 🌐 STEP 4: Deploy to Railway (FREE Hosting)

1. Create account at: https://railway.app
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. Deploy:
   ```bash
   railway init
   railway up
   ```
4. Add environment variables in Railway Dashboard:
   - Go to your project → Variables
   - Add all variables from your `.env` file

5. Get your public URL (e.g. `https://selvas-cafe.railway.app`)
6. Update in `.env`:
   ```
   FRONTEND_URL=https://selvas-cafe.railway.app
   ```

---

## 🔗 STEP 5: Connect Frontend Website

In your `index.html` website, update the API calls to use your Railway URL.

Add this script to your website's `<head>`:
```html
<script>
  const API_BASE = 'https://your-railway-url.railway.app/api';
</script>
```

Update the order form submit function in your website:
```javascript
async function submitOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const item = document.getElementById('orderItem').value;
  const qty = document.getElementById('orderQty').value || 1;
  const note = document.getElementById('orderNote').value;
  const pay = document.getElementById('payMode').value;

  if (!name || !phone || !item) {
    showToast('⚠️ Please fill all required fields!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        phone: phone,
        address: address,
        items: [{ id: 1, name: item, qty: parseInt(qty), price: 100 }], // map items properly
        payment_mode: pay,
        special_notes: note,
      })
    });
    const data = await response.json();
    if (data.success) {
      showToast(`🎉 ${data.message} Order #: ${data.order.order_number}`);
    } else {
      showToast(`❌ ${data.message}`, true);
    }
  } catch(err) {
    showToast('❌ Could not connect. Please call us directly!');
  }
}
```

---

## 📊 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | ❌ | Admin login → returns JWT token |
| GET | `/api/admin/stats` | ✅ | Dashboard stats |
| GET | `/api/admin/customers` | ✅ | All customers |
| GET | `/api/admin/settings` | ✅ | Get shop settings |
| POST | `/api/admin/settings` | ✅ | Update shop settings |
| GET | `/api/admin/search?q=` | ✅ | Search orders |
| GET | `/api/admin/export` | ✅ | Export orders as CSV |
| POST | `/api/orders/place` | ❌ | Place new order |
| GET | `/api/orders/track/:orderNum` | ❌ | Track order by number |
| GET | `/api/orders` | ✅ | All orders (with filters) |
| PATCH | `/api/orders/:id/status` | ✅ | Update order status |
| DELETE | `/api/orders/:id` | ✅ | Delete order |
| GET | `/api/menu` | ❌ | Get available menu items |
| POST | `/api/menu` | ✅ | Add menu item |
| PUT | `/api/menu/:id` | ✅ | Update menu item |
| PATCH | `/api/menu/:id/toggle` | ✅ | Toggle item availability |
| DELETE | `/api/menu/:id` | ✅ | Delete menu item |
| GET | `/api/health` | ❌ | Server health check |
| GET | `/api/shop-status` | ❌ | Shop open/closed status |

---

## 🔐 Admin Panel

**URL:** `http://localhost:3001/admin` (or your Railway URL + /admin)

**Login credentials:**
- Username: `selva`
- Password: `selva135`

**Features:**
- 📊 Live dashboard with order stats and revenue
- 🛒 Full order management (view, update status, delete)
- 🔍 Search orders by name, phone, or order number
- 🍽️ Menu management (add, enable/disable, delete items)
- 👥 Customer database with order history
- ⚙️ Shop settings (open/close times, delivery charge)
- 🟢/🔴 One-click shop open/close toggle
- ⬇️ Export all orders to CSV

---

## 📞 Support

Shop: Selva's Cafe & Bakes
Address: Bharathiyar Bus Stand (op), Ettayapuram Rd, Vilathikulam, TN 628907
Phone: +91 8438837809
Email: sehwardzrhenius@gmail.com
UPI: 8438837809@ybl
