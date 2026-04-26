const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'SUCCESS' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', DepositSchema);