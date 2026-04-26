const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models Import
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const BinaryHistory = require('../models/BinaryHistory');
const Deposit = require('../models/Deposit');
const Transaction = require('../models/Transaction');

 const auth = require('../middleware/auth');

// 🎯 POST /api/user/claim-task (With Capping Logic)
// =======================================================
// 🟢 PACKAGES CONFIGURATION (Isey file me top par rakhna)
// =======================================================
const packagesConfig = {
    10:  { maxTasks: 2,  taskRate: 0.10, maxEarn: 20 },
    30:  { maxTasks: 6,  taskRate: 0.10, maxEarn: 75 },
    50:  { maxTasks: 10, taskRate: 0.10, maxEarn: 150 },
    100: { maxTasks: 20, taskRate: 0.10, maxEarn: 400 },
    500: { maxTasks: 50, taskRate: 0.10, maxEarn: 2500 }
};

// =======================================================
// 🎯 POST /api/user/claim-task (Purana delete karke ye dalo)
// =======================================================
// 🎯 POST /api/user/claim-task

// ==========================================
// 📦 CONFIGURATIONS
// ==========================================
const RANK_RULES = [
    { name: 'Bronze',   totalRequired: 100,   reward: 20 },
    { name: 'Silver',   totalRequired: 600,   reward: 50 },
    { name: 'Gold',     totalRequired: 1600,  reward: 100 },
    { name: 'Platinum', totalRequired: 4100,  reward: 300 },
    { name: 'Diamond',  totalRequired: 9100,  reward: 1000 },
    { name: 'Ruby',     totalRequired: 19100, reward: 1500 }
];

// Tasks Config (Aapke system ke hisaab se)
 

// ==========================================
// 🛠️ HELPER: Update Upline Business & Binary
// ==========================================
const updateUplineBusiness = async (currentPlacementId, position, amount) => {
    let nextPlacementId = currentPlacementId;
    let nextPosition = position ? position.toUpperCase() : null;

    while (nextPlacementId && nextPlacementId !== 'NONE') {
        const parent = await User.findOne({ userId: nextPlacementId });
        if (!parent) break;

        if (!parent.binaryBusiness) parent.binaryBusiness = { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 };
        if (!parent.wallets) parent.wallets = { matchingIncome: 0, rankReward: 0, totalEarned: 0 };

        if (nextPosition === 'LEFT') parent.binaryBusiness.leftVolume += Number(amount);
        else if (nextPosition === 'RIGHT') parent.binaryBusiness.rightVolume += Number(amount);

        const leftVol = parent.binaryBusiness.leftVolume;
        const rightVol = parent.binaryBusiness.rightVolume;

        if (leftVol > 0 && rightVol > 0) {
            const matchedVolume = Math.min(leftVol, rightVol);
            const binaryIncome = matchedVolume * 0.10; 

            parent.wallets.matchingIncome += binaryIncome;
            parent.wallets.totalEarned += binaryIncome;
            parent.walletBalance += binaryIncome;
            parent.binaryBusiness.totalPairsMatched += 1;

            // PLUS-PLUS Rank Logic
            const totalMatchedTurnover = parent.wallets.matchingIncome * 10;
            for (const rank of RANK_RULES) {
                const currentRankIdx = RANK_RULES.findIndex(r => r.name === parent.currentRank);
                const potentialRankIdx = RANK_RULES.findIndex(r => r.name === rank.name);

                if (totalMatchedTurnover >= rank.totalRequired && potentialRankIdx > currentRankIdx) {
                    parent.currentRank = rank.name;
                    parent.wallets.rankReward = (parent.wallets.rankReward || 0) + rank.reward;
                    parent.walletBalance += rank.reward;
                    parent.wallets.totalEarned += rank.reward;
                }
            }

            await BinaryHistory.create({
                userId: parent.userId, leftBusiness: leftVol, rightBusiness: rightVol,
                matchedVolume, incomeEarned: binaryIncome,
                carryForwardLeft: leftVol - matchedVolume, carryForwardRight: rightVol - matchedVolume
            });

            parent.binaryBusiness.leftVolume -= matchedVolume;
            parent.binaryBusiness.rightVolume -= matchedVolume;
        }

        parent.markModified('binaryBusiness');
        parent.markModified('wallets');
        await parent.save({ validateBeforeSave: false });

        nextPosition = parent.position ? parent.position.toUpperCase() : null;
        nextPlacementId = parent.placementId;
    }
};



// 🔍 GET /api/user/check-status/:userId (Verify karne ke liye)
router.get('/check-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // User ko dhoondho (Number cast zaroori hai)
        const user = await User.findOne({ userId: Number(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Sirf zaroori data bhejo security ke liye
        res.status(200).json({ 
            user: {
                name: user.name,
                userId: user.userId,
                currentPackage: user.currentPackage || 0,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Check Status Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// 📦 POST /api/user/buy-package-for-user
// 📦 POST /api/user/buy-package-for-user
// 📦 POST /api/user/buy-package-for-user
router.post('/buy-package-for-user', async (req, res) => {
    try {
        const { buyerId, targetUserId, packageAmount, transactionPassword } = req.body;

        const amount = Number(packageAmount);
        if (amount < 10) return res.status(400).json({ message: "Minimum package amount is $10" });

        const buyer = await User.findOne({ _id: buyerId }); 
        if (!buyer) return res.status(404).json({ message: "Buyer account not found." });

        if (buyer.transactionPassword !== transactionPassword) {
            return res.status(401).json({ message: "Incorrect transaction password!" });
        }

        if (buyer.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient Wallet Balance!" });
        }

        const targetUser = await User.findOne({ userId: Number(targetUserId) });
        if (!targetUser) return res.status(404).json({ message: "Target User ID not found." });

        // 1. Buyer se paise kato
        buyer.walletBalance -= amount;

        // 2. Target ka Package aur Capping Add (Push) karo
        targetUser.isActive = true;
        if (!targetUser.activePackages) targetUser.activePackages = [];
        targetUser.activePackages.push(amount);
        targetUser.currentPackage = Math.max(targetUser.currentPackage || 0, amount);

        // Capping ko Plus (+) karo
        const newCap = (amount * 2); // Ya apne packagesConfig ke hisaab se set karo
        targetUser.totalCap = (targetUser.totalCap || 0) + newCap; 

        // 3. 💰 DIRECT INCOME LOGIC
        const sponsor = await User.findOne({ userId: targetUser.sponsorId });
        if (sponsor && sponsor.isActive) { 
            const directIncome = amount * 0.10; 
            sponsor.wallets.directIncome = (sponsor.wallets.directIncome || 0) + directIncome;
            sponsor.wallets.totalEarned = (sponsor.wallets.totalEarned || 0) + directIncome;
             await sponsor.save({ validateBeforeSave: false }); 

            // 📝 HISTORY 1: SPONSOR DIRECT INCOME
            await Transaction.create({
                userId: sponsor.userId,
                amount: directIncome,
                type: 'DIRECT_INCOME',
                transactionType: 'credit', // Paisa aaya
                walletType: 'direct_income', // 👈 Schema se sync kiya
                fromUserId: targetUser.userId, // 👈 Pata chalega kis user se income aayi
                description: `Direct Income from User ${targetUser.userId} package activation`,
                status: 'completed' // 🟢 NAYA FIX: 'success' ki jagah 'completed'
            });
        }

        await buyer.save({ validateBeforeSave: false });
        await targetUser.save({ validateBeforeSave: false });

        // 📝 HISTORY 2: BUYER KE PAISE KATE
        await Transaction.create({
            userId: buyer.userId, 
            amount: amount,
            type: 'PACKAGE_BUY',
            transactionType: 'debit', // Paisa gaya
            walletType: 'main_wallet', // 👈 Balance main wallet se kata
            toUserId: targetUser.userId, // 👈 Kiske liye kharida
            packageAmount: amount,
            description: `Purchased $${amount} plan for User ${targetUser.userId} (${targetUser.name})`,
            status: 'completed' // 🟢 NAYA FIX: 'success' ki jagah 'completed'
        });

        // 📝 HISTORY 3: TARGET USER KO PACKAGE MILA
        await Transaction.create({
            userId: targetUser.userId,
            amount: amount,
            type: 'PACKAGE_ACTIVATION',
            transactionType: 'credit', // Package mila
            fromUserId: buyer.userId, // 👈 Kisne kharid kar diya
            packageAmount: amount,
            description: `Package $${amount} activated by User ${buyer.userId} (${buyer.name})`,
            status: 'completed' // 🟢 NAYA FIX: 'success' ki jagah 'completed'
        });

        res.status(200).json({ 
            message: `Successfully activated $${amount} package for ${targetUser.name}!`,
            buyer: buyer 
        });

    } catch (error) {
        console.error("Buy Package Error:", error);
        res.status(500).json({ message: "Server error during package purchase." });
    }
});

// GET: User ki Package History
// GET: User ki Package History (user.js ke andar)
// 🟢 GET: User Package History API
router.get('/my-package-history/:userId', async (req, res) => {
    try {
        const targetId = Number(req.params.userId);

        // Transaction DB se data nikalna
        const history = await Transaction.find({
            userId: targetId,
            $or: [
                // 1. Jo package mere account pe active hue (Self Purchase ya kisi aur ne diya)
                { type: 'PACKAGE_ACTIVATION' },
                // 2. Jo package maine DUSRO ke liye kharide (Duplicate hatane ke liye)
                { type: 'PACKAGE_BUY', toUserId: { $ne: targetId } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
});
// 🎯 POST /api/user/claim-task
router.post('/claim-task', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ userId: Number(userId) });
        if (!user) return res.status(400).json({ message: "User record nahi mila!" });

        // 🟢 NAYA FIX: User ke paas jitne bhi packages hain, sabke tasks ko jod lo
        let totalMaxTasks = 0;
        const activePkgs = user.activePackages && user.activePackages.length > 0 
            ? user.activePackages 
            : (user.currentPackage ? [user.currentPackage] : []);

        if (activePkgs.length === 0 || !user.isActive) {
            return res.status(400).json({ message: `Aapke paas active package nahi hai!` });
        }

        activePkgs.forEach(pkgAmount => {
            if (packagesConfig[pkgAmount]) {
                totalMaxTasks += packagesConfig[pkgAmount].maxTasks;
            }
        });

        // Aapke plan ke hisaab se har task ka paisa $0.10 fix hai
        const taskRate = 0.10; 

        // 🛡️ CHECK 1: Total Capping Limit Check
        if ((user.wallets.taskIncome || 0) + taskRate > user.totalCap) {
            user.isActive = false; 
            await user.save({ validateBeforeSave: false });
            return res.status(400).json({ 
                message: `Aapke packages ki total limit ($${user.totalCap}) poori ho gayi hai. Naya package buy karein!` 
            });
        }

        // 🛡️ CHECK 2: Daily Limit Check (Sab packages ke tasks milakar)
        if (user.dailyVideosWatched >= totalMaxTasks) {
            return res.status(400).json({ 
                message: "Aapka aaj ka saare packages ka quota poora ho chuka hai! Kal aana." 
            });
        }

        // 💰 INCOME CREDIT
        user.wallets.taskIncome = (user.wallets.taskIncome || 0) + taskRate;
        user.wallets.totalEarned = (user.wallets.totalEarned || 0) + taskRate;
        user.dailyVideosWatched += 1;

        if (user.dailyVideosWatched >= totalMaxTasks) {
            user.taskCompletedToday = true;
        }

        await user.save({ validateBeforeSave: false });

        res.status(200).json({ 
            message: `Task Completed! +$${taskRate} added. 💰`, 
            user: user 
        });

    } catch (err) {
        console.error("Claim Task Error:", err);
        res.status(500).json({ message: "Server error during task claim" });
    }
});

// backend/routes/user.js ke andar check karein



// 🔄 POST: Income Wallet to Main Wallet (Re-invest)
// 🔄 POST: Income Wallet to Main Wallet (Convert)
router.post('/income-to-wallet', async (req, res) => {
    try {
        const { userId, items, transactionPassword } = req.body;

        // 1. User dhoondo
        const numericUserId = Number(userId);
        const user = await User.findOne({ userId: numericUserId });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // 2. Password Check
        if (user.transactionPassword !== transactionPassword) {
            return res.status(401).json({ message: "Invalid security password!" });
        }

        // 3. Validation & Total Calculation
        let totalToTransfer = 0;
        const transferItems = Array.isArray(items) ? items : [];
        
        for (let item of transferItems) {
            const amount = Number(item.amount);
            const walletId = item.source;

            if (amount <= 0) continue;
            if (user.wallets[walletId] < amount) {
                return res.status(400).json({ message: `Insufficient balance in ${walletId}` });
            }
            totalToTransfer += amount;
        }

        if (totalToTransfer < 1) {
            return res.status(400).json({ message: "Minimum transfer amount is $1" });
        }

        // 4. Execution: Sub-wallets se kaato aur Main Wallet mein dalo
        for (let item of items) {
            const amount = Number(item.amount);
            user.wallets[item.source] -= amount;
        }
        
        user.walletBalance = (user.walletBalance || 0) + totalToTransfer;
        await user.save({ validateBeforeSave: false });

        // 5. 📝 HISTORY: Transaction entry
        await Transaction.create({
            userId: user.userId,
            amount: totalToTransfer,
            type: 'INCOME_REINVEST', 
            transactionType: 'credit', 
            walletType: 'main_wallet',
            description: `Converted $${totalToTransfer.toFixed(2)} income to Main Wallet`,
            status: 'completed'
        });

        res.status(200).json({ 
            message: `Successfully transferred $${totalToTransfer.toFixed(2)} to Main Wallet!`,
            user: user 
        });

    } catch (error) {
        console.error("Income to Wallet Error:", error);
        res.status(500).json({ message: "Server error during conversion." });
    }
});


// 🟢 GET: Income to Wallet Conversion History
// 🟢 GET: Income to Wallet Conversion History
// Dhyan de: Iska path '/convert-history/:userId' hona chahiye
router.get('/convert-history/:userId', async (req, res) => {
    try {
        const id = Number(req.params.userId);
        
        // Transaction table se entries uthao
        const history = await Transaction.find({
            userId: id,
            type: 'INCOME_REINVEST'
        }).sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (err) {
        console.error("Convert History Error:", err);
        res.status(500).json({ message: "Failed to load conversion history" });
    }
});


// 🟢 GET: Main Wallet History (Top-up & Usage)
// 🟢 Paste this in backend/routes/user.js
router.get('/wallet-history/:userId', async (req, res) => {
    try {
        const id = Number(req.params.userId);
        const history = await Transaction.find({
            userId: id,
            walletType: 'main_wallet' 
        }).sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// 🟢 GET: All Transactions (Universal History)
router.post('/all-history', async (req, res) => {
    try {
        const { userId } = req.body;
        const id = Number(userId);

        // Sab kuch uthao aur latest transactions upar rakho
        const history = await Transaction.find({ userId: id }).sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (err) {
        console.error("All History Error:", err);
        res.status(500).json({ message: "Failed to load all history" });
    }
});

// 🔍 GET: Transfer ke liye User Name dhoondna
router.get('/find-name/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: Number(req.params.userId) }, { name: 1 });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ name: user.name });
    } catch (err) {
        res.status(500).json({ message: "Error searching user" });
    }
});
// 💸 POST /api/user/transfer
// 💸 POST: P2P Wallet Transfer
router.post('/transfer', async (req, res) => {
    try {
        const { senderId, receiverId, amount, transactionPassword } = req.body;
        const transferAmount = Number(amount);

        // 1. Strict Number Check for IDs
        const numericSenderId = Number(senderId);
        const numericReceiverId = Number(receiverId);

        if (numericSenderId === numericReceiverId) {
            return res.status(400).json({ message: "You cannot transfer to yourself!" });
        }

        // 2. Sender Verification
        const sender = await User.findOne({ userId: numericSenderId });
        if (!sender) return res.status(404).json({ message: "Sender not found." });

        if (sender.transactionPassword !== transactionPassword) {
            return res.status(401).json({ message: "Invalid security password!" });
        }

        if (sender.walletBalance < transferAmount) {
            return res.status(400).json({ message: "Insufficient balance in Main Wallet." });
        }

        // 3. Receiver Verification
        const receiver = await User.findOne({ userId: numericReceiverId });
        if (!receiver) return res.status(404).json({ message: "Receiver ID does not exist." });

        // 4. Atomic Execution (Paise ka len-den)
        sender.walletBalance -= transferAmount;
        receiver.walletBalance += transferAmount;

        await sender.save({ validateBeforeSave: false });
        await receiver.save({ validateBeforeSave: false });

        // 5. 📝 HISTORY: Sender ke liye (Debit)
        await Transaction.create({
            userId: sender.userId,
            amount: transferAmount,
            type: 'TRANSFER_SENT',
            transactionType: 'debit',
            walletType: 'main_wallet',
            toUserId: receiver.userId,
            description: `Fund transferred to User ${receiver.userId} (${receiver.name})`,
            status: 'completed'
        });

        // 6. 📝 HISTORY: Receiver ke liye (Credit)
        await Transaction.create({
            userId: receiver.userId,
            amount: transferAmount,
            type: 'TRANSFER_RECEIVED',
            transactionType: 'credit',
            walletType: 'main_wallet',
            fromUserId: sender.userId,
            description: `Fund received from User ${sender.userId} (${sender.name})`,
            status: 'completed'
        });

        res.status(200).json({ 
            message: `Successfully transferred $${transferAmount} to ${receiver.name}`,
            user: sender // Frontend balance update karne ke liye
        });

    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ message: "Server error during transfer." });
    }
});


// 📜 GET /api/user/transfer-history/:userId
// 🟢 GET: P2P Transfer History
router.get('/transfer-history/:userId', async (req, res) => {
    try {
        const id = Number(req.params.userId);
        const history = await Transaction.find({
            userId: id,
            type: { $in: ['TRANSFER_SENT', 'TRANSFER_RECEIVED'] }
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 📦 GET /api/user/package-history/:userId
router.get('/package-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Hum Transaction model mein se sirf 'topup' types dhoondhenge
        const history = await Transaction.find({
            userId: userId,
            type: { $in: ['topup', 'package_activation'] } 
        }).sort({ createdAt: -1 });

        res.status(200).json(history || []);
    } catch (error) {
        console.error("Package history error:", error);
        res.status(500).json({ message: "Package history load nahi ho payi" });
    }
});
 
// 6. Deposit History Route
router.get('/deposit-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // User ki 7-digit ID se dhoondhna
        const history = await Deposit.find({ userId: userId }).sort({ createdAt: -1 });
        
        // Agar history na ho toh 404 nahi, khali array bhejni chahiye
        res.status(200).json(history || []); 
    } catch (err) {
        console.error("Deposit History Error:", err);
        res.status(500).json({ message: "History fetch karne mein dikkat aayi" });
    }
});


// backend/routes/user.js ke andar


// ==========================================
// 1. 🟢 POST: Naya Withdrawal Request Daalna
// ==========================================
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, items, transactionPassword, walletAddress } = req.body;

        // 1. 🟢 STRICT NUMBER CHECK: Ensure userId is 7-digit number
        const numericUserId = Number(userId);
        if (isNaN(numericUserId) || numericUserId === 0) {
            return res.status(400).json({ message: "Invalid User ID format!" });
        }

        const user = await User.findOne({ userId: numericUserId });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // 2. Password Check
        if (user.transactionPassword !== transactionPassword) {
            return res.status(401).json({ message: "Incorrect security password!" });
        }

        // 3. Validation: Sabhi selected wallets ka balance check karo
        let totalWithdrawAmount = 0;
        
        // Agar items array nahi hai (single withdraw case), toh empty array handle karo
        const withdrawItems = Array.isArray(items) ? items : [];
        if (withdrawItems.length === 0) {
            return res.status(400).json({ message: "Please select at least one wallet to withdraw." });
        }

        for (let item of withdrawItems) {
            const amount = Number(item.amount);
            const walletId = item.source; // e.g., 'directIncome', 'taskIncome'

            if (amount <= 0) continue; 

            // Logic: Agar source 'main_wallet' hai toh user.walletBalance check karo, 
            // varna user.wallets[walletId] check karo
            let currentBalance = (walletId === 'main_wallet') 
                ? user.walletBalance 
                : user.wallets[walletId];

            if (currentBalance === undefined || currentBalance < amount) {
                return res.status(400).json({ message: `Insufficient balance in ${walletId}` });
            }

            totalWithdrawAmount += amount;
        }

        // 4. Minimum $5 Requirement
        if (totalWithdrawAmount < 5) { 
            return res.status(400).json({ message: "Minimum total withdrawal is $5" });
        }

        // 5. Execution: Paise Kaato
        for (let item of withdrawItems) {
            const amount = Number(item.amount);
            const walletId = item.source;

            if (amount > 0) {
                if (walletId === 'main_wallet') {
                    user.walletBalance -= amount;
                } else {
                    user.wallets[walletId] -= amount;
                }
            }
        }
        
        user.wallets.totalWithdrawn = (user.wallets.totalWithdrawn || 0) + totalWithdrawAmount;
        await user.save({ validateBeforeSave: false });

        // 6. 🟢 Withdrawal Table (Admin Entry)
        await Withdrawal.create({
            userId: user.userId,
            name: user.name,
            userDisplayId: String(user.userId),
            amount: totalWithdrawAmount,
            walletAddress: walletAddress || user.walletAddress,
            status: 'pending' // Lowercase 'pending' (Check your model enum)
        });

        // 7. 🟢 Transaction History (User History)
        await Transaction.create({
            userId: user.userId,
            amount: totalWithdrawAmount,
            type: 'WITHDRAWAL',
            transactionType: 'debit',
            walletType: 'multi_wallet', 
            description: `Withdrawal request for $${totalWithdrawAmount.toFixed(2)}`,
            status: 'pending' 
        });

        res.status(200).json({ 
            message: "Withdrawal request submitted! Pending admin approval.",
            user: user 
        });

    } catch (error) {
        console.error("Combined Withdraw Error:", error);
        res.status(500).json({ message: "Server error during withdrawal." });
    }
});

// ==========================================
// 2. 🟢 GET: Withdrawal History Dekhna
// ==========================================
router.get('/withdrawals/:userId', async (req, res) => {
    try {
        const targetId = Number(req.params.userId);

        // Naye logic me hum seedha Transaction table se data uthayenge jahan type 'WITHDRAWAL' hai
        const history = await Transaction.find({ 
            userId: targetId,
            type: 'WITHDRAWAL'
        }).sort({ createdAt: -1 });
        
        res.status(200).json(history || []); 
    } catch (err) {
        console.error("Withdrawal History Error:", err);
        res.status(500).json({ message: "Failed to load withdrawal history" });
    }
});

// 7. Withdrawals History Route
 
// ==========================================
// 🚀 ROUTES WITH INLINE LOGIC
// ==========================================

// 1. Get Profile (Smart ID Check)
router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ 
            $or: [
                { _id: mongoose.isValidObjectId(id) ? id : null }, 
                { userId: id }, 
                { userId: Number(id) }
            ].filter(Boolean)
        }).select('-password');

        if (!user) return res.status(404).json({ message: "User record not found" });
        res.status(200).json({ user });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// 2. Direct Team (Aggregation Logic)
router.get('/direct-team/:userId', async (req, res) => {
    try {
        const currentUserId = Number(req.params.userId);
        const result = await User.aggregate([
            { $match: { sponsorId: currentUserId } },
            {
                $graphLookup: {
                    from: "users",
                    startWith: "$userId",
                    connectFromField: "userId",
                    connectToField: "sponsorId",
                    as: "fullDownline",
                }
            },
            {
                $project: {
                    userId: 1, name: 1, mobile: 1, createdAt: 1,
                    totalTeam: { $size: "$fullDownline" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(result.map((m, i) => ({ srNo: i + 1, ...m })));
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 3. My Team (POST format for dashboard)
router.post('/my-team', async (req, res) => {
    try {
        const { userId, type } = req.body;
        const userDoc = await User.findOne({ 
            $or: [{ _id: mongoose.isValidObjectId(userId) ? userId : null }, { userId: userId }] 
        });
        if (!userDoc) return res.status(404).json({ message: "User not found" });

        if (type === 'direct') {
            const directs = await User.find({ sponsorId: userDoc.userId }).sort({ createdAt: -1 });
            return res.status(200).json(directs);
        }

        const fullTeam = await User.aggregate([
            { $match: { userId: userDoc.userId } },
            {
                $graphLookup: {
                    from: "users",
                    startWith: "$userId",
                    connectFromField: "userId",
                    connectToField: "sponsorId",
                    as: "downline",
                    maxDepth: 50
                }
            }
        ]);
        res.status(200).json(fullTeam.length > 0 ? fullTeam[0].downline : []);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// 4. Activate Package
router.post('/activate-package', async (req, res) => {
    try {
        const { userId, packageAmount } = req.body;
        const user = await User.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.walletBalance < packageAmount) return res.status(400).json({ message: "Insufficient balance!" });

        user.walletBalance -= packageAmount;
        user.currentPackage = packageAmount;
        user.isActive = true;
        await user.save({ validateBeforeSave: false });

        await updateUplineBusiness(user.placementId, user.position, packageAmount);
        res.status(200).json({ message: "Activated!", user });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

 // 🎯 POST /api/user/claim-task
 


// 💰 POST /api/user/add-demo-fund (Ya /api/users/add-demo-fund)
router.post('/add-demo-fund', async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // 1. Check karo data aaya ya nahi
        if (!userId || !amount) {
            return res.status(400).json({ message: "User ID aur Amount dono bhejna zaroori hai!" });
        }

        // 2. Database mein User dhoondho
        const user = await User.findOne({ userId: Number(userId) });
        if (!user) {
            return res.status(404).json({ message: "Bhai, is ID ka koi user nahi mila!" });
        }

        // 3. Wallet mein paise add karo (Aapke schema ke hisaab se 'walletBalance' use kar rahe hain)
        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        
        await user.save();

        res.status(200).json({ 
            message: `Success! $${amount} added to Demo Wallet. ✅`,
            walletBalance: user.walletBalance,
            user: user
        });

    } catch (error) {
        console.error("❌ Add Demo Fund Error:", error);
        res.status(500).json({ message: "Server crash ho gaya fund add karte waqt!" });
    }
});

// 6. Deposit History
router.get('/deposit-history/:userId', async (req, res) => {
    try {
        const history = await Deposit.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});


 

// 1. Check if Wallet Exists (To ensure uniqueness)
router.post('/check-wallet', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) return res.json({ exists: false });

        const userWithWallet = await User.findOne({ walletAddress });
        res.json({ exists: !!userWithWallet });
    } catch (err) {
        res.status(500).json({ message: 'Server error checking wallet' });
    }
});

// 2. Update Profile (Wallet)
router.put('/:userId', auth, async (req, res) => {
    try {
        const { walletAddress, oldTxnPassword } = req.body;
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify Transaction Password
        if (!user.txnPassword) return res.status(400).json({ message: "Txn password not set. Contact admin." });
        
        const isMatch = await bcrypt.compare(oldTxnPassword, user.txnPassword);
        if (!isMatch) return res.status(400).json({ message: "Incorrect Transaction Password!" });

        // Update Wallet Address
        if (walletAddress && walletAddress !== user.walletAddress) {
            
            // Check uniqueness
            const exists = await User.findOne({ walletAddress });
            if (exists) return res.status(400).json({ message: "Wallet address already used by another user." });

            // Max 2 changes per 24 hours Logic
            const now = Date.now();
            if (user.walletAddressChangeWindowStart && (now - user.walletAddressChangeWindowStart.getTime() < 24 * 60 * 60 * 1000)) {
                if (user.walletAddressChangeCount >= 2) {
                    return res.status(400).json({ message: "You can change wallet only 2 times in 24 hours." });
                }
                user.walletAddressChangeCount += 1;
            } else {
                // Reset window
                user.walletAddressChangeWindowStart = new Date();
                user.walletAddressChangeCount = 1;
            }

            user.walletAddress = walletAddress;
        }

        await user.save();
        res.json({ message: "Profile updated successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// 3. Change Password (Login & Txn)
router.put('/change-password/:userId', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword, oldTxnPassword, newTxnPassword } = req.body;
        const user = await User.findOne({ userId: req.params.userId });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Case A: Update Login Password
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: "Incorrect Current Login Password!" });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Case B: Update Transaction Password
        if (oldTxnPassword && newTxnPassword) {
            if (!user.txnPassword) return res.status(400).json({ message: "Txn password not set." });
            
            const isMatch = await bcrypt.compare(oldTxnPassword, user.txnPassword);
            if (!isMatch) return res.status(400).json({ message: "Incorrect Current Txn Password!" });

            const salt = await bcrypt.genSalt(10);
            user.txnPassword = await bcrypt.hash(newTxnPassword, salt);
        }

        await user.save();
        res.json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;




 