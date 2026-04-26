require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// 📦 Imports logic
const allRoutes = require('./routes'); 
const startSweeper = require('./cron/sweepJob');
const User = require('./models/User'); 

const app = express();

// 🔥 ZAROORI: NGINX & Real IP Support
// Jab Nginx peeche se request bhejta hai, toh asli User IP milne ke liye ye zaroori hai
app.set('trust proxy', true);

// ====================== 1. CORS SETUP (Production Ready) ======================
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  // 🟢 LIVE DOMAINS (Inhe apne asli domain se replace karein)
  'https://financialsaarthi.live',
  'https://www.financialsaarthi.live'
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

// 🛡️ API 404 Handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: "API Route Not Found!" });
});

// ====================== 3. FRONTEND SERVING (Vite dist folder) ======================
// ====================== 3. FRONTEND SERVING (Vite dist folder) ======================
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  
  app.use(express.static(frontendPath));
  
  // 🟢 FIXED: '/*' ki jagah '(.*)' use karein (Naye Express engine ke liye)
  app.get('(.*)', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🚀 Backend API is running locally.');
  });
}

// ====================== 4. DB & SERVER START ======================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');

    // 👑 AUTO-CREATE ROOT USER (ID: 1000000)
    // Hum ise role 'user' de rahe hain taaki binary tree sahi chale
    try {
      const rootExists = await User.findOne({ userId: 1000000 });
      if (!rootExists) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10); 
        
        await new User({
          userId: 1000000,
          name: 'System Root',
          email: 'root@system.com',
          password: hashedPassword,
          sponsorId: 0,
          placementId: 0,
          position: 'NONE',
          isActive: true,
          role: 'user', // 👈 User hi rakha hai taaki network tree shuru ho sake
          walletBalance: 0
        }).save({ validateBeforeSave: false });

        console.log('👑 System Root Node Created -> ID: 1000000');
      }
    } catch (err) {
      console.error('⚠️ Root creation error:', err.message);
    }

    // Start Cron Jobs
    try {
      startSweeper(); 
      console.log('✅ Sweeper Job Active');
    } catch (error) {
      console.error('⚠️ Cron error:', error);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
      -----------------------------------------
      🚀 FinSaarthi Server LIVE on port ${PORT}
      🛠️ Mode: ${process.env.NODE_ENV || 'development'}
      -----------------------------------------
      `);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });