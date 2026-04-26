const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: { type: Number, required: true }, // NAYA FIX: Isey 'Number' rehne do, ObjectId mat karna
    name: { type: String }, // Required hata diya ya backend se pass karenge
    userDisplayId: { type: String }, // Iski ab khaas zarurat nahi hai, par schema me rakh lete hain
    amount: { type: Number, required: true },
    walletAddress: { type: String, required: true },
    adminNote: { type: String, default: "" },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], // Saare lowercase hone chahiye
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);