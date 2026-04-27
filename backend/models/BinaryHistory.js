const mongoose = require('mongoose');

const binaryHistorySchema = new mongoose.Schema({
    userId: { 
        type: Number, 
        required: true, 
        index: true // Fast searching ke liye
    },
    leftBusiness: { type: Number, default: 0 },
    rightBusiness: { type: Number, default: 0 },
    matchedVolume: { type: Number, default: 0 },
    flushedVolume: { type: Number, default: 0 }, // Capping ki wajah se jo flush hua
    incomeEarned: { type: Number, default: 0 },
    carryForwardLeft: { type: Number, default: 0 },
    carryForwardRight: { type: Number, default: 0 },
    isCapped: { type: Boolean, default: false } // Kya us din capping hit hui thi?
}, { 
    timestamps: true // Ye automatically createdAt aur updatedAt add kar dega
});

module.exports = mongoose.model('BinaryHistory', binaryHistorySchema);