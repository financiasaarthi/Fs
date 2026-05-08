const mongoose = require('mongoose');
require('dotenv').config(); // .env file se DB connection lene ke liye

// Apne models import karo
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');
// 🟢 NAYA ADD KIYA: BinaryHistory model import kiya
const BinaryHistory = require('./models/BinaryHistory');

const resetTestingData = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        
        // Naye mongoose mein options hatane padte hain
        await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
        
        console.log("✅ Database Connected!");
        console.log("🚀 Starting Testing Data Cleanup...");

        // 1. 🗑️ DELETE HISTORIES FROM DATABASE
        console.log("🗑️ Deleting Direct Income, Withdrawal, Binary & Manual histories...");
        
        // Purani cheezein
        const delDirect = await Transaction.deleteMany({ type: 'DIRECT_INCOME' });
        const delTxnWithdraw = await Transaction.deleteMany({ type: 'WITHDRAWAL' });
        const delWithdrawals = await Withdrawal.deleteMany({});
        
        // 🟢 NAYA ADD KIYA: Admin Manual Transactions aur Binary History delete karna
        const delManual = await Transaction.deleteMany({ type: { $in: ['MANUAL_CREDIT', 'MANUAL_DEBIT'] } });
        const delBinaryHistory = await BinaryHistory.deleteMany({});

        console.log(`✅ Deleted ${delDirect.deletedCount} Direct Incomes.`);
        console.log(`✅ Deleted ${delTxnWithdraw.deletedCount} Transaction Withdrawals.`);
        console.log(`✅ Deleted ${delWithdrawals.deletedCount} Withdrawal Requests.`);
        console.log(`✅ Deleted ${delManual.deletedCount} Admin Manual Transactions.`);
        console.log(`✅ Deleted ${delBinaryHistory.deletedCount} Binary History logs.`);

        // 2. 🔄 UPDATE ALL USERS WALLET & BALANCES
        // ⚠️ JAISA AAPNE KAHA: Wallet me kuch extra add nahi kiya hai, sab purana wala hi hai ⚠️
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
        console.log("🎉 Testing data completely wiped. Binary & Admin Manual history also deleted!");

        // Process khatam hone ke baad DB disconnect kar do
        mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("❌ Reset Script Error:", error);
        mongoose.disconnect();
        process.exit(1);
    }
};

resetTestingData();