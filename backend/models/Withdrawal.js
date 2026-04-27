const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    // 🟢 7-digit User ID
    userId: { 
        type: Number, 
        required: true 
    }, 
    name: { 
        type: String 
    },
    userDisplayId: { 
        type: String 
    },
    
    // 🟢 ADMIN TABLE FIELDS (Ye zaroori hain $0.00 fix karne ke liye)
    gross: { 
        type: Number, 
        default: 0 
    }, // Total amount before fee
    fee: { 
        type: Number, 
        default: 0 
    },   // 10% Deduction amount
    net: { 
        type: Number, 
        default: 0 
    },   // Final amount after fee
    
    amount: { 
        type: Number, 
        required: true 
    }, // Isme hum hamesha Net Amount hi save karenge
    
    source: { 
        type: String, 
        default: "MAIN WALLET" 
    }, // ROI, Direct, etc. dikhane ke liye
    
    walletAddress: { 
        type: String, 
        required: true 
    },
    
    // 🟢 Blockchain Hash (Approval ke waqt save hoga)
    txnHash: { 
        type: String, 
        default: "" 
    },
    
    adminNote: { 
        type: String, 
        default: "" 
    },
    
    status: { 
        type: String, 
        // 🛡️ Note: Backend 'approved' (lower) bhej raha hai, 
        // par UI 'APPROVED' (upper) check karta hai. 
        // Humne donon ko handle karne ke liye enum expand kar diya hai.
        enum: ['pending', 'approved', 'rejected', 'SUCCESS', 'APPROVED', 'REJECTED'],
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);