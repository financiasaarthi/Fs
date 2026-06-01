require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// TODO: Apne models ka sahi path update kar lena
const User = require('./models/User'); 
const Transaction = require('./models/Transaction');

const RANK_RULES = [
    { name: 'Bronze',   totalRequired: 100,   reward: 20 },
    { name: 'Silver',   totalRequired: 600,   reward: 50 },
    { name: 'Gold',     totalRequired: 1600,  reward: 100 },
    { name: 'Platinum', totalRequired: 4100,  reward: 300 },
    { name: 'Diamond',  totalRequired: 9100,  reward: 1000 },
    { name: 'Ruby',     totalRequired: 19100, reward: 1500 }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fixMissingRankRewards() {
    try {
        // 1. Connect to Database using .env
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ MONGO_URI nahi mila .env file me!");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(mongoURI);
        console.log("✅ Database Connected Successfully!\n");

        console.log("🔍 Scanning users for missing rank rewards...");
        const users = await User.find({});
        let usersToFix = [];

        // 2. Find eligible users
        for (let user of users) {
            if (!user.wallets) continue;
            
            // Total matched turnover logic (same as your system)
            const totalMatchedTurnover = (user.wallets.totalMatchingIncome || 0) * 10;
            
            let expectedTotalReward = 0;
            let expectedRank = user.currentRank;

            // Calculate exact total reward they SHOULD have received till now
            for (const rank of RANK_RULES) {
                if (totalMatchedTurnover >= rank.totalRequired) {
                    expectedTotalReward += rank.reward;
                    expectedRank = rank.name;
                }
            }

            const currentPaidRankReward = user.wallets.totalRankReward || 0;
            const pendingReward = expectedTotalReward - currentPaidRankReward;

            // Agar pending reward > 0 hai, toh list me add karo
            if (pendingReward > 0) {
                usersToFix.push({
                    userId: user.userId,
                    turnover: totalMatchedTurnover,
                    currentRank: user.currentRank || 'None',
                    shouldBeRank: expectedRank,
                    paidReward: currentPaidRankReward,
                    pendingReward: pendingReward
                });
            }
        }

        // 3. Show Terminal Table
        if (usersToFix.length === 0) {
            console.log("🎉 Sabhi users ka rank reward already up-to-date hai. Koi issue nahi hai.");
            process.exit(0);
        }

        console.log(`\n⚠️ Total ${usersToFix.length} users ko unka poora Rank Reward nahi mila hai:\n`);
        console.table(usersToFix);

        // 4. Ask for Permission
        rl.question(`\n❓ Kya aap in ${usersToFix.length} users ko unka pending reward distribute karna chahte hain? (Y/N): `, async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                console.log("\n🚀 Distributing pending rewards...");
                
                // 5. Update Database
                for (let data of usersToFix) {
                    const user = await User.findOne({ userId: data.userId });
                    
                    user.currentRank = data.shouldBeRank;
                    user.wallets.rankReward = (user.wallets.rankReward || 0) + data.pendingReward;
                    user.wallets.totalEarned = (user.wallets.totalEarned || 0) + data.pendingReward;
                    user.wallets.totalRankReward = (user.wallets.totalRankReward || 0) + data.pendingReward;
                    
                    await user.save({ validateBeforeSave: false });

                    // Create Transaction Entry
                    await Transaction.create({
                        userId: user.userId,
                        amount: data.pendingReward,
                        type: 'RANK_REWARD',
                        transactionType: 'credit',
                        walletType: 'rank_reward',
                        description: `System Audit: Pending Rank Reward distributed up to ${data.shouldBeRank} Rank.`,
                        status: 'completed'
                    });
                    
                    console.log(`✅ Distributed $${data.pendingReward} to ${data.userId}`);
                }
                console.log("\n🎉 Sabhi pending rank rewards successfully distribute ho gaye aur transactions create ho gaye!");
            } else {
                console.log("\n❌ Process cancelled. Kisi bhi user ka data change nahi hua.");
            }
            process.exit(0);
        });

    } catch (error) {
        console.error("❌ Error occurred:", error);
        process.exit(1);
    }
}

fixMissingRankRewards();