const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // 🔹 User jiska transaction hai (Linked to User Model's userId)
    userId: { type: Number, required: true, index: true },

    // 🔹 1. Transaction Type (Exactly matching your MLM logic)
    type: {
      type: String,
      enum: [
        "PACKAGE_BUY",          // Buyer ne package kharida
        "PACKAGE_ACTIVATION",   // Target user ka package activate hua
        "DIRECT_INCOME",        // Sponsor ko direct referral bonus mila
        "ROI_INCOME",           // Video/Task dekhne ki income (taskIncome)
        "BINARY_INCOME",        // Left-Right matching (matchingIncome)
        "RANK_REWARD",          // Rank achieve karne par bonus
        "ROYALTY_INCOME",       // Royalty bonus
        "WITHDRAWAL",           // User ne crypto withdraw kiya
        "DEPOSIT",              // User ne USDT deposit kiya
        'TRANSFER_SENT',     // 👈 Ye add karo
            'TRANSFER_RECEIVED', // 👈 Ye bhi add karo
            'INCOME_REINVEST', // 👈 Ye naya wala add kar do
        "MANUAL_CREDIT",        // Admin ne fund diya
        "MANUAL_DEBIT"          // Admin ne fund kata
      ],
      required: true,
    },

    // 🔹 2. Financial Direction
    transactionType: { 
      type: String, 
      enum: ['credit', 'debit'], 
      required: true 
    },

    // 🔹 3. Related Wallet (NAYA ADD KIYA: User Model ke 'wallets' object se sync karne ke liye)
    // Isse pata chalega ki paisa main 'walletBalance' mein gaya ya 'directIncome' wale sub-wallet mein
    walletType: {
      type: String,
      enum: [
        'main_wallet',      // UserSchema.walletBalance
        'task_income',      // UserSchema.wallets.taskIncome
        'direct_income',    // UserSchema.wallets.directIncome
        'matching_income',  // UserSchema.wallets.matchingIncome
        'rank_reward',      // UserSchema.wallets.rankReward
        'royalty_income',    // UserSchema.wallets.royaltyIncome
        'multi_wallet' // 👈 Bas ye ek line add karni hai
      ],
      default: 'main_wallet'
    },

    // 🔹 4. Amounts (Number for MERN stack performance)
    amount: { type: Number, required: true },
    grossAmount: { type: Number, default: null }, // Agar 5% withdrawal fee kat-ti hai, toh gross amount idhar aayega

    // 🔹 5. Inter-User Tracking (MLM ke liye must hai)
    fromUserId: { type: Number, default: null }, // Paisa kiske referral/kaam se aaya
    toUserId: { type: Number, default: null },   // Paisa kisko gaya

    // 🔹 6. Package Information (For PACKAGE_BUY / ACTIVATION)
    packageAmount: { type: Number, default: null }, // e.g., 10, 50, 100

    // 🔹 7. Readability & Blockchain Links
    description: { type: String, default: "" }, 
    txHash: { type: String, default: null },    // Crypto transaction hash
    adminNote: { type: String, default: null }, // Admin ki secret tippani

    // 🔹 8. Status
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },

  },
  { timestamps: true } 
);

// ✅ HIGH-PERFORMANCE INDEXES (For Aggregation & Reporting)
transactionSchema.index({ userId: 1, type: 1, createdAt: -1 }); 
transactionSchema.index({ txHash: 1 }, { sparse: true }); // sparse isliye kyunki saare txHash nahi honge (e.g., internal ROI)
transactionSchema.index({ status: 1 }); 
transactionSchema.index({ walletType: 1 }); // Admin report nikal sake kis wallet mein kitna paisa bata hai

module.exports = mongoose.model("Transaction", transactionSchema);