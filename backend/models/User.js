const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 🟢 Basic Identity & Auth
  userId: { type: Number, required: true, unique: true, index: true }, // 👈 Number kar diya taaki logic fast chale
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobile: { type: String, required: true, unique: true }, 
  country: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'promo'], default: 'user' },
  password: { type: String, required: true },
  transactionPassword: { type: String, default: '123456' }, 

  // 🛡️ Security & Multi-Account Prevention (MISSING FIELDS ADDED)
  ipAddress: { type: String, default: null }, // 👈 Iske bina 500 error aa raha tha
  deviceId: { type: String, default: null },  // 👈 Device Manager ke liye zaroori
  telegramId: { type: String, default: null },
  isTelegramJoined: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }, // 👈 User ban karne ke liye

  // 🟢 MLM Network Fields
  sponsorId: { type: Number, required: true, index: true },
  placementId: { type: Number, required: true, index: true },
  position: { type: String, enum: ['LEFT', 'RIGHT', 'NONE'], required: true },
  
  // 🟢 Binary Tracking (Direct Tree Objects)
  parentPlacementId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leftChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rightChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  binaryBusiness: {
    leftVolume: { type: Number, default: 0 },
    rightVolume: { type: Number, default: 0 },
    totalPairsMatched: { type: Number, default: 0 }
  },

  // 🟢 Package & Status
  isActive: { type: Boolean, default: false },
  currentPackage: { type: Number, default: null },
  activePackages: [{ type: Number }], 
  totalCap: { type: Number, default: 0 },
  topUpAmount: { type: Number, default: 0 },

  // 🟢 Task Tracking (Video ROI)
  walletBalance: { type: Number, default: 0 },
  dailyVideosWatched: { type: Number, default: 0 },
  taskCompletedToday: { type: Boolean, default: false },
  lastTaskDate: { type: Date, default: null },
  
  // 🟢 Income Wallets
  wallets: {
    taskIncome: { type: Number, default: 0 },
    directIncome: { type: Number, default: 0 },
    matchingIncome: { type: Number, default: 0 },
    rankReward: { type: Number, default: 0 },
    royaltyIncome: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 } 
  },

  // 💰 Crypto/Withdrawal Details
  walletAddress: { type: String, default: '' },
  depositAddress: { type: String, unique: true, sparse: true },

  // 🟢 Rank & Salary
  currentRank: { 
    type: String, 
    enum: ['None', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'],
    default: 'None' 
  },
  salaryMonthsRemaining: { type: Number, default: 0 }
}, { timestamps: true });

// 🔥 PERFORMANCE INDEXES (2000 Users ke liye zaruri)
userSchema.index({ ipAddress: 1 });
userSchema.index({ deviceId: 1 });
userSchema.index({ sponsorId: 1, createdAt: -1 }); // Tree loading fast karne ke liye

module.exports = mongoose.model('User', userSchema);