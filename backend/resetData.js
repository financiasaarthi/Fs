const mongoose = require('mongoose');
require('dotenv').config(); // .env file se DB connection lene ke liye

// Apne models import karo
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');
const BinaryHistory = require('./models/BinaryHistory');

const resetTestingData = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        
        // Naye mongoose mein options hatane padte hain
        await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
        
        console.log("✅ Database Connected!");
        console.log("🚀 Starting Testing Data Cleanup...");

        // 1. 🗑️ DELETE HISTORIES FROM DATABASE
        console.log("🗑️ Deleting Direct, Withdrawal, Binary AND Matching histories...");        
        // Purani cheezein
        const delDirect = await Transaction.deleteMany({ type: 'DIRECT_INCOME' });
        const delTxnWithdraw = await Transaction.deleteMany({ type: 'WITHDRAWAL' });
        const delWithdrawals = await Withdrawal.deleteMany({});
         const delBinaryHistory = await BinaryHistory.deleteMany({});
        
        // 🟢 NAYA ADD KIYA: Transaction table se Matching Income uda rahe hain
        const delMatching = await Transaction.deleteMany({ type: { $in: ['MATCHING_INCOME', 'BINARY_INCOME', 'MATCHING'] } });

        console.log(`✅ Deleted ${delDirect.deletedCount} Direct Incomes.`);
        console.log(`✅ Deleted ${delTxnWithdraw.deletedCount} Transaction Withdrawals.`);
        console.log(`✅ Deleted ${delWithdrawals.deletedCount} Withdrawal Requests.`);
         console.log(`✅ Deleted ${delBinaryHistory.deletedCount} Binary History logs.`);
        console.log(`✅ Deleted ${delMatching.deletedCount} Matching Income logs.`); // Matching status

        // 2. 🔄 UPDATE ALL USERS WALLET & BALANCES
        console.log("🔄 Resetting User Wallets (Matching Income 0 kar rahe hain, Power Leg safe hai)...");
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

                // 🟢 E. NAYA ADD KIYA: Matching Income ko bhi 0 karo
                user.wallets.matchingIncome = 0;
                user.wallets.totalMatchingIncome = 0;

                // F. Total Earned ko theek karo (Kyunki baaki sab 0 ho gaya, ab sirf Task Income bachegi)
                const task = user.wallets.totalTaskIncome || user.wallets.taskIncome || 0;
                user.wallets.totalEarned = task;
            }

            // 🛡️ YAHAN POWER LEG (LEFT/RIGHT BUSINESS) KO TOUCH NAHI KIYA HAI!
            // Wo ekdum safe rahegi jaisi thi waisi hi!

            // Save user without validation to bypass any strict rules
            await user.save({ validateBeforeSave: false });
            updateCount++;
        }

        console.log(`✅ Cleanup Done! Successfully reset ${updateCount} users.`);
        console.log("🎉 Testing data wiped. Matching Income 0 ho gayi aur Power Leg 100% SAFE hai!");

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