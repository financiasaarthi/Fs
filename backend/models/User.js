const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 🟢 Basic Identity & Auth
  userId: { type: Number, required: true, unique: true, index: true }, 
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobile: { type: String, required: true, unique: true }, 
  country: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'promo'], default: 'user' },
  password: { type: String, required: true },
  transactionPassword: { type: String }, 

  // 🛡️ Security & Multi-Account Prevention
  ipAddress: { type: String, default: null }, 
  deviceId: { type: String, default: null },  
  telegramId: { type: String, default: null },
  isTelegramJoined: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }, 


  resetToken: { 
      type: String, 
      default: null 
  },
  resetTokenExpiry: { 
      type: Number, 
      default: null 
  },

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

  todayBinaryIncome: { type: Number, default: 0 },
  lastBinaryDate: { type: String, default: "" },

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
  
  // 🟢 Income Wallets (🔥 YAHAN CHANGES KIYE HAIN 🔥)
  wallets: {
    // 🔴 1. WITHDRAWABLE BALANCES (Ye minus hote hain withdrawal par)
    taskIncome: { type: Number, default: 0 },
    directIncome: { type: Number, default: 0 },
    matchingIncome: { type: Number, default: 0 },
    rankReward: { type: Number, default: 0 },
    royaltyIncome: { type: Number, default: 0 },
    
    // 🟢 2. LIFETIME TOTAL BALANCES (Ye KABHI minus nahi hote, Dashboard inko dikhayega)
    totalTaskIncome: { type: Number, default: 0 },
    totalDirectIncome: { type: Number, default: 0 },
    totalMatchingIncome: { type: Number, default: 0 },
    totalRankReward: { type: Number, default: 0 },
    totalRoyaltyIncome: { type: Number, default: 0 },

    // Overall Tracking
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




// 🔥 PERFORMANCE INDEXES
userSchema.index({ ipAddress: 1 });
userSchema.index({ deviceId: 1 });
userSchema.index({ sponsorId: 1, createdAt: -1 }); 

module.exports = mongoose.model('User', userSchema);