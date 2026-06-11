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
        "deposit",              // 👈 FIX: Lowercase deposit allow kiya
        "SWEEP",                // Central wallet me fund move karne ke liye
        "sweep",                // 👈 FIX: Lowercase sweep allow kiya
        "TRANSFER_SENT",        // Internal transfer
        "TRANSFER_RECEIVED",    // Internal transfer receive
        "INCOME_REINVEST",      // Income se wapas wallet recharge
        "MANUAL_CREDIT",        // Admin ne fund diya
        "MANUAL_DEBIT",         // Admin ne fund kata
        "WALLET_FUND"           // 🟢 👈 NAYA FIX: 30% Auto-Wallet credit from withdrawal
      ],
      required: true,
    },

    // 🔹 2. Financial Direction (Flexible banaya gaya hai)
    transactionType: { 
      type: String, 
      enum: ['credit', 'debit', 'deposit', 'withdraw'], // 👈 Options badha diye
      default: 'credit' // 👈 FIX: "required: true" hata kar default de diya taaki script crash na ho
    },

    // 🔹 3. Related Wallet 
    walletType: {
      type: String,
      enum: [
        'main_wallet',      // UserSchema.walletBalance
        'task_income',      // UserSchema.wallets.taskIncome
        'direct_income',    // UserSchema.wallets.directIncome
        'matching_income',  // UserSchema.wallets.matchingIncome
        'rank_reward',      // UserSchema.wallets.rankReward
        'royalty_income',   // UserSchema.wallets.royaltyIncome
        'multi_wallet'      // IncomeToWallet conversions ke liye
      ],
      default: 'main_wallet'
    },

    // 🔹 4. Amounts (Number for MERN stack performance)
    amount: { type: Number, required: true },
    grossAmount: { type: Number, default: null }, // Agar withdrawal fee kat-ti hai, toh gross amount aayega

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