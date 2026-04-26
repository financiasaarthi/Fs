const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const Admin = require("../models/Admin"); 
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Deposit = require("../models/Deposit");
const bcrypt = require("bcryptjs");

// 💸 POST: Manual Credit/Debit processing
router.post("/manual-transaction", adminAuth, async (req, res) => {
  try {
    console.log("\n--- 👉 Manual Transaction Processing ---");

    // 1. Data Extract karo
    const { userId, amount, type, txHash, adminNote, adminPassword, password } = req.body;
    
    const finalPassword = adminPassword || password;
    if (!finalPassword) {
      return res.status(400).json({ message: "Admin password is required." });
    }

    // 🔍 2. Admin dhundo
    const tokenData = req.admin || req.user;
    const adminDbId = tokenData.adminId || tokenData.id || tokenData._id;
    const admin = await Admin.findById(adminDbId);

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found. Please Re-Login." });
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(finalPassword, admin.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect Admin Password!" });
    }

    // 4. Input Validation
    if (!userId || !amount || !type) {
      return res.status(400).json({ message: "User ID, amount, and type are required." });
    }

    const targetUser = await User.findOne({ userId: Number(userId) });
    if (!targetUser) return res.status(404).json({ message: "Target User not found." });

    const amt = parseFloat(amount);
    
    // Duplicate TxHash Check
    if (txHash) {
      const existingTx = await Transaction.findOne({ txHash });
      if (existingTx) return res.status(400).json({ message: "TxHash already used." });
    }

    // --- ⬇️ BALANCE UPDATE LOGIC ⬇️ ---

    // Model Enums ke hisab se mapping (Uppercase important hai)
    let dbType, dbTransactionType;

    if (type === "manual_credit") {
      targetUser.walletBalance += amt;
      dbType = "MANUAL_CREDIT";       // ✅ Match model enum
      dbTransactionType = "credit";   // ✅ Required field
    } else if (type === "manual_debit") {
      if (targetUser.walletBalance < amt) {
        return res.status(400).json({ message: "Insufficient balance." });
      }
      targetUser.walletBalance -= amt;
      dbType = "MANUAL_DEBIT";        // ✅ Match model enum
      dbTransactionType = "debit";    // ✅ Required field
    } else {
      return res.status(400).json({ message: "Invalid transaction type." });
    }
    
    await targetUser.save();

    const defaultDescription = dbType === "MANUAL_CREDIT" 
        ? `Manual Credit of ${amt} USDT by Admin` 
        : `Manual Debit of ${amt} USDT by Admin`;

    // --- ⬇️ TRANSACTION RECORD (Matching Your Model Exactly) ⬇️ ---
    const transaction = new Transaction({
      userId: Number(userId),         // ✅ Number format
      type: dbType,                   // ✅ "MANUAL_CREDIT" or "MANUAL_DEBIT"
      transactionType: dbTransactionType, // ✅ "credit" or "debit" (Required)
      walletType: 'main_wallet',      // ✅ Required Enum
      amount: amt,
      txHash: txHash || `MANUAL-${Date.now()}`, 
      description: defaultDescription,
      adminNote: adminNote || null,
      status: "completed"
      // Note: 'source' aur 'plan' model me nahi hain isliye hata diye
    });

    await transaction.save();

    res.json({
      success: true,
      message: `Successfully ${dbTransactionType}ed $${amt} to user ${userId}`,
      transaction,
    });

  } catch (err) {
    console.error("❌ Critical Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// 📜 GET: Fetch recent manual transactions
router.get("/manual-transactions", adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Filter: Humne model me source nahi rakha, toh type se filter karenge
        const filter = { type: { $in: ["MANUAL_CREDIT", "MANUAL_DEBIT"] } };
        
        const total = await Transaction.countDocuments(filter);
        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        res.json({ 
            transactions, 
            total, 
            totalPages: Math.ceil(total / limit), 
            currentPage: page 
        });
    } catch (err) {
        res.status(500).json({ message: "Error loading transactions" });
    }
});

module.exports = router;