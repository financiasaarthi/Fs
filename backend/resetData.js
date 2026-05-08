const mongoose = require('mongoose');
require('dotenv').config(); // .env file se DB connection lene ke liye

// Apne models import karo
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');

const resetTestingData = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        
        // 🟢 FIX: Naye mongoose mein options hatane padte hain
        await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
        
        console.log("✅ Database Connected!");
        console.log("🚀 Starting Testing Data Cleanup...");

        // 1. 🗑️ DELETE HISTORIES FROM DATABASE
        console.log("🗑️ Deleting Direct Income and Withdrawal histories...");
        const delDirect = await Transaction.deleteMany({ type: 'DIRECT_INCOME' });
        const delTxnWithdraw = await Transaction.deleteMany({ type: 'WITHDRAWAL' });
        const delWithdrawals = await Withdrawal.deleteMany({});
        
        console.log(`✅ Deleted ${delDirect.deletedCount} Direct Incomes & ${delTxnWithdraw.deletedCount} Withdrawal logs.`);

        // 2. 🔄 UPDATE ALL USERS WALLET & BALANCES
        console.log("🔄 Resetting User Wallets...");
        const users = await User.find({});
        let updateCount = 0;

        for (let user of users) {
            // A. Main Wallet Balance 0 karo
            user.walletBalance = 0;

            if (user.wallets) {
                // B. Direct Income 0 karo
                user.wallets.directIncome = 0;
                user.wallets.totalDirectIncome = 0;

                // C. Rank Reward 0 karo
                user.wallets.rankReward = 0;
                user.wallets.totalRankReward = 0;

                // D. Withdrawal 0 karo
                user.wallets.totalWithdrawn = 0;

                // E. Total Earned ko theek karo (Sirf Matching + Task bachega)
                const matching = user.wallets.totalMatchingIncome || user.wallets.matchingIncome || 0;
                const task = user.wallets.totalTaskIncome || user.wallets.taskIncome || 0;
                
                user.wallets.totalEarned = matching + task;
            }

            // Save user without validation to bypass any strict rules
            await user.save({ validateBeforeSave: false });
            updateCount++;
        }

        console.log(`✅ Cleanup Done! Successfully reset ${updateCount} users.`);
        console.log("🎉 Testing data has been completely wiped. System is ready for fresh start!");

        // Process khatam hone ke baad DB disconnect kar do
        mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("❌ Reset Script Error:", error);
        mongoose.disconnect();
        process.exit(1);
    }
};

// Function ko run karo
resetTestingData();