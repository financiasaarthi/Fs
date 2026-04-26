const mongoose = require('mongoose');

const binaryHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now },
    
    // Us din ka total business (Carry forward + Naya business)
    leftBusiness: { type: Number, default: 0 },
    rightBusiness: { type: Number, default: 0 },
    
    // Matching calculations
    matchedVolume: { type: Number, default: 0 },
    utilizedVolume: { type: Number, default: 0 }, // Capping ke hisab se kitna use hua
    flushedVolume: { type: Number, default: 0 },  // Jo capping ke upar gaya aur zero ho gaya
    
    // Bacha hua jo agle din jayega
    carryForwardLeft: { type: Number, default: 0 },
    carryForwardRight: { type: Number, default: 0 },
    
    // Us din ki kamai
    incomeEarned: { type: Number, default: 0 },
    isCapped: { type: Boolean, default: false }
});

module.exports = mongoose.model('BinaryHistory', binaryHistorySchema);