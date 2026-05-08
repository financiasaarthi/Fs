// utils/incomeHelper.js
const User = require('../models/User');

// Universal function income add karne ke liye
const creditIncome = async (userId, incomeType, amount) => {
    try {
        const user = await User.findOne({ userId });
        if (!user) return false;

        // Income type ke hisaab se total field ka naam match karenge
        const fieldMapping = {
            'directIncome': 'totalDirectIncome',
            'matchingIncome': 'totalMatchingIncome',
            'taskIncome': 'totalTaskIncome',
            'rankReward': 'totalRankReward',
            'royaltyIncome': 'totalRoyaltyIncome'
        };

        const totalField = fieldMapping[incomeType];

        // 1. Withdrawable balance mein add kiya
        user.wallets[incomeType] = (user.wallets[incomeType] || 0) + amount;

        // 2. Lifetime Total mein add kiya (Agar valid type hai)
        if (totalField) {
            user.wallets[totalField] = (user.wallets[totalField] || 0) + amount;
        }

        // 3. Total Earned mein add kiya
        user.wallets.totalEarned = (user.wallets.totalEarned || 0) + amount;

        // Save kar diya
        await user.save({ validateBeforeSave: false });
        return true;
    } catch (error) {
        console.error(`Error crediting ${incomeType} to user ${userId}:`, error);
        return false;
    }
};

module.exports = { creditIncome };