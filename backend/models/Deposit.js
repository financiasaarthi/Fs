const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    // 🔹 User ki 7-digit numeric ID
    userId: { 
        type: Number, 
        required: true, 
        index: true 
    },

    // 🔹 Kitna USDT deposit hua
    amount: { 
        type: Number, 
        required: true 
    },

    // 🔹 Blockchain Transaction Hash (BSC Scan link ke liye zaroori hai)
    txHash: { 
        type: String, 
        default: null,
        unique: true, // Taaki ek hi deposit do baar na ho jaye
        sparse: true 
    },

    // 🔹 Status management
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'SUCCESS'], // SUCCESS purane data ke liye rakha hai
        default: 'completed' 
    },

    // 🔹 Description ya Admin notes
    description: { 
        type: String, 
        default: "USDT Deposit (BEP-20)" 
    },

    // 🔹 Timestamps
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Performance ke liye index lagaya hai
DepositSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Deposit', DepositSchema);