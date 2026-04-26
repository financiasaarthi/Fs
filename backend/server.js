require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// 📦 Imports logic
const allRoutes = require('./routes'); 
const startSweeper = require('./cron/sweepJob');
const User = require('./models/User'); // 👈 Admin check ke liye zaroori hai

const app = express();

// 🔥 ZAROORI: NGINX & Real IP Support
app.set('trust proxy', true);

// ====================== 1. CORS SETUP (Secure) ======================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("🚫 Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ====================== 2. API ROUTES ======================
app.use('/api', allRoutes);

// 🛡️ API 404 Handler (Ise routes ke BAAD rakha hai taaki asli routes chalein)
app.use('/api', (req, res) => {
  res.status(404).json({ message: "API Route Not Found! Path sahi check karein." });
});

// ====================== 3. FRONTEND SERVING ======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🚀 Backend API is running locally. Use React on port 3000 or 5173.');
  });
}

// ====================== 4. DB & SERVER START ======================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully (Fresh DB detected)');

    // 👑 AUTO-CREATE SUPER ADMIN (ID: 1000000)
    // Ye tabhi chalega jab DB ekdum khali hoga
    try {
      const adminExists = await User.findOne({ userId: 1000000 });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10); // Default Password
        
        await new User({
          userId: 1000000,
          name: 'Super Admin',
          email: 'admin@.com',
          password: hashedPassword,
          sponsorId: 0,
          placementId: 0,
          position: 'NONE',
          isActive: true,
          role: 'admin',
          walletBalance: 0
        }).save({ validateBeforeSave: false });

        console.log('👑 Super Admin Created Successfully -> ID: 1000000');
      }
    } catch (err) {
      console.error('⚠️ Admin creation error:', err.message);
    }

    try {
      // 🟢 Cron Jobs start karna
      startSweeper(); 
      console.log('✅ Sweeper Job Active');
    } catch (error) {
      console.error('⚠️ Error starting Background Jobs:', error);
    }

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
      -----------------------------------------
      🚀 Server is LIVE on port ${PORT}
      🛠️ Mode: ${process.env.NODE_ENV || 'development'}
      👑 Default Admin: 1000000 / Admin@123
      -----------------------------------------
      `);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });