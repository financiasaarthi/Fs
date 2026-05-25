const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models Import
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const BinaryHistory = require('../models/BinaryHistory');
const Deposit = require('../models/Deposit');
const Transaction = require('../models/Transaction');
const TaskHistory = require('../models/TaskHistory');
  const authMiddleware = require('../middleware/authMiddleware'); 
 const DummyUser = require('../models/DummyUser.js'); // 🔥 Naya model
 const DummyTransaction = require('../models/DummyTransaction');

const { creditIncome } = require('../utils/incomeHelper');
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
    const todayStr = new Date().toDateString(); // Aaj ki date check karne ke liye

    while (nextPlacementId && nextPlacementId !== 'NONE') {
        const parent = await User.findOne({ userId: nextPlacementId });
        if (!parent) break;

        if (!parent.binaryBusiness) parent.binaryBusiness = { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 };
        if (!parent.wallets) parent.wallets = { matchingIncome: 0, rankReward: 0, totalEarned: 0 };
        
        // Naya Din shuru hua toh daily income zero kar do
        if (parent.lastBinaryDate !== todayStr) {
            parent.todayBinaryIncome = 0;
            parent.lastBinaryDate = todayStr;
        }

        // Volume add karo
        if (nextPosition === 'LEFT') parent.binaryBusiness.leftVolume += Number(amount);
        else if (nextPosition === 'RIGHT') parent.binaryBusiness.rightVolume += Number(amount);

        const leftVol = parent.binaryBusiness.leftVolume;
        const rightVol = parent.binaryBusiness.rightVolume;

        if (leftVol > 0 && rightVol > 0) {
            // Kitna match hua (ex: 150 L, 120 R -> matched = 120)
            const matchedVolume = Math.min(leftVol, rightVol);
            let binaryIncome = matchedVolume * 0.10; 
            
            let flushedVolume = 0;
            let isCapped = false;

            // 🎯 CAPPING LOGIC START
            // Parent ka daily cap uske total active packages ke barabar hai (ex: $10 + $30 = $40 Cap)
            const dailyCap = parent.activePackages ? parent.activePackages.reduce((a, b) => a + b, 0) : 0;

            if (parent.todayBinaryIncome + binaryIncome > dailyCap) {
                // Sirf utna paisa do jitna cap bacha hai
                const availableIncome = Math.max(0, dailyCap - parent.todayBinaryIncome);
                binaryIncome = availableIncome;
                isCapped = true;

                // Flush calculate karo (Jo volume match hua par paise nahi mile)
                const utilizedVolume = binaryIncome / 0.10;
                flushedVolume = matchedVolume - utilizedVolume;
            }

            // Sirf tabhi aage badho agar kuch income mili ho
            if (binaryIncome > 0 || flushedVolume > 0) {
                parent.todayBinaryIncome += binaryIncome;
                parent.wallets.matchingIncome += binaryIncome;
                parent.wallets.totalEarned += binaryIncome;
                parent.wallets.totalMatchingIncome = (parent.wallets.totalMatchingIncome || 0) + binaryIncome;
                parent.binaryBusiness.totalPairsMatched += 1;

                if (binaryIncome > 0) {
                    await Transaction.create({
                        userId: parent.userId,
                        amount: binaryIncome,
                        type: 'BINARY_INCOME',
                        transactionType: 'credit',
                        walletType: 'matching_income', 
                        description: `Binary Income for $${matchedVolume - flushedVolume} match.`,
                        status: 'completed'
                    });
                }

                // Plus-Plus Rank Logic (Same as before)
// ✅ SAHI CODE: Ye lifetime total earning use karega
                const totalMatchedTurnover = (parent.wallets.totalMatchingIncome || 0) * 10;
                for (const rank of RANK_RULES) {
                    const currentRankIdx = RANK_RULES.findIndex(r => r.name === parent.currentRank);
                    const potentialRankIdx = RANK_RULES.findIndex(r => r.name === rank.name);
                    if (totalMatchedTurnover >= rank.totalRequired && potentialRankIdx > currentRankIdx) {
                        parent.currentRank = rank.name;
                        parent.wallets.rankReward = (parent.wallets.rankReward || 0) + rank.reward;
                        parent.wallets.totalEarned += rank.reward;
                        parent.wallets.totalRankReward = (parent.wallets.totalRankReward || 0) + rank.reward;

                        await Transaction.create({
                            userId: parent.userId, amount: rank.reward, type: 'RANK_REWARD',
                            transactionType: 'credit', walletType: 'rank_reward',
                            description: `Achieved ${rank.name} Rank`, status: 'completed'
                        });
                    }
                }

                // 📝 HISTORY: Frontend table ke liye perfect data
                await BinaryHistory.create({
                    userId: parent.userId,
                    leftBusiness: leftVol,
                    rightBusiness: rightVol,
                    matchedVolume: matchedVolume - flushedVolume,
                    flushedVolume: flushedVolume,
                    incomeEarned: binaryIncome,
                    carryForwardLeft: leftVol - matchedVolume, 
                    carryForwardRight: rightVol - matchedVolume,
                    isCapped: isCapped
                });
            }

            // Hamesha poora matched volume minus hoga, chahe paise milein ya flush ho jayein
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


router.get('/total-users', async (req, res) => {
  try {
    // Database me total users count karne ke liye Mongoose ka countDocuments() method
    const totalUsers = await User.countDocuments();

    // Agar aapko sirf active users count karne hain toh aap ye line use kar sakte hain:
    // const totalUsers = await User.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      totalUsers: totalUsers
    });

  } catch (error) {
    console.error("Error counting total users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Total users count nahi ho paaye."
    });
  }
});
// ==========================================
// 🛠️ DATA RECOVERY SCRIPT FOR OLD USERS
// Isko sirf 1 baar run karna hai
// ==========================================
router.get('/fix-missing-income', async (req, res) => {
    try {
        console.log("Starting Data Recovery for Old Users...");

        // Saare users ko database se nikaalo
        const users = await User.find({});
        let fixedCount = 0;

        for (let user of users) {
            // 1. Calculate Total Direct Income from History
            const directTx = await Transaction.find({ userId: user.userId, type: 'DIRECT_INCOME' });
            const totalDirect = directTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

            // 2. Calculate Total Matching / Binary Income from History
            const binaryTx = await Transaction.find({ userId: user.userId, type: 'BINARY_INCOME' });
            const totalBinary = binaryTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

            // 3. Calculate Total Rank Reward from History
            const rankTx = await Transaction.find({ userId: user.userId, type: 'RANK_REWARD' });
            const totalRank = rankTx.reduce((sum, tx) => sum + (tx.amount || 0), 0);

            // 4. Calculate Total Task Income from Task History
            const taskTx = await TaskHistory.find({ userId: user.userId });
            const totalTask = taskTx.reduce((sum, tx) => sum + (tx.reward || 0), 0);

            // Agar user ke paas wallets object nahi hai toh bana do
            if (!user.wallets) user.wallets = {};

            // 5. Nayi 'Lifetime Total' fields mein asli lifetime data daal do
            user.wallets.totalDirectIncome = totalDirect;
            user.wallets.totalMatchingIncome = totalBinary;
            user.wallets.totalRankReward = totalRank;
            user.wallets.totalTaskIncome = totalTask;

            // 6. Subka Total kar do taaki 'Total Earned' ekdum accurate ho
            user.wallets.totalEarned = totalDirect + totalBinary + totalRank + totalTask;

            // Save the user data without validation errors
            await user.save({ validateBeforeSave: false });
            fixedCount++;
        }

        console.log(`✅ Recovery Successful! Fixed ${fixedCount} users.`);
        res.status(200).json({ 
            message: "Success! Puraane sabhi users ki missing income history se recover ho gayi hai.",
            totalUsersFixed: fixedCount
        });

    } catch (error) {
        console.error("Recovery Script Error:", error);
        res.status(500).json({ message: "Error running recovery script", error: error.message });
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

        // Dono users ko ek sath find karo (Parallel execution for speed)
        const [buyer, targetUser] = await Promise.all([
            User.findOne({ userId: buyerId }),
            User.findOne({ userId: Number(targetUserId) })
        ]);

        if (!buyer) return res.status(404).json({ message: "Buyer account not found." });
        if (!targetUser) return res.status(404).json({ message: "Target User ID not found." });

        if (buyer.transactionPassword !== transactionPassword) {
            return res.status(401).json({ message: "Incorrect transaction password!" });
        }

        if (buyer.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient Wallet Balance!" });
        }

        // 🟢 Duplicate Package Check
        if (targetUser.activePackages && targetUser.activePackages.includes(amount)) {
            return res.status(400).json({ 
                message: `User already has the $${amount} package active. Please upgrade to a different package.` 
            });
        }

        // 1. Buyer se paise kato
        buyer.walletBalance -= amount;

        // 2. Target ka Package aur Capping Add (Push) karo
        targetUser.isActive = true;
        if (!targetUser.activePackages) targetUser.activePackages = [];
        targetUser.activePackages.push(amount);
        targetUser.currentPackage = Math.max(targetUser.currentPackage || 0, amount);

        // Capping ko Plus (+) karo
        const newCap = (amount * 2); 
        targetUser.totalCap = (targetUser.totalCap || 0) + newCap; 

        // Ye array hum banayenge sab kuch ek sath save karne ke liye
        const dbOperations = []; 

        // 🟢 FIX: DIRECT INCOME LOGIC
        if (amount > 10) {
            const sponsor = await User.findOne({ userId: targetUser.sponsorId });
            if (sponsor && sponsor.isActive) { 
                const directIncome = amount * 0.10; 
                
                sponsor.wallets.directIncome = (sponsor.wallets.directIncome || 0) + directIncome;
                sponsor.wallets.totalDirectIncome = (sponsor.wallets.totalDirectIncome || 0) + directIncome;
                sponsor.wallets.totalEarned = (sponsor.wallets.totalEarned || 0) + directIncome;
                
                dbOperations.push(sponsor.save({ validateBeforeSave: false }));

                // 📝 HISTORY 1: SPONSOR DIRECT INCOME
                dbOperations.push(Transaction.create({
                    userId: sponsor.userId,
                    amount: directIncome,
                    type: 'DIRECT_INCOME',
                    transactionType: 'credit', 
                    walletType: 'direct_income', 
                    fromUserId: targetUser.userId, 
                    description: `Direct Income from User ${targetUser.userId} package activation`,
                    status: 'completed'
                }));
            }
        }

        // Add main saves to our parallel array
        dbOperations.push(buyer.save({ validateBeforeSave: false }));
        dbOperations.push(targetUser.save({ validateBeforeSave: false }));

        // 📝 HISTORY 2: BUYER KE PAISE KATE
        dbOperations.push(Transaction.create({
            userId: buyer.userId, 
            amount: amount,
            type: 'PACKAGE_BUY',
            transactionType: 'debit', 
            walletType: 'main_wallet', 
            toUserId: targetUser.userId, 
            packageAmount: amount,
            description: `Purchased $${amount} plan for User ${targetUser.userId} (${targetUser.name})`,
            status: 'completed' 
        }));

        // 📝 HISTORY 3: TARGET USER KO PACKAGE MILA
        dbOperations.push(Transaction.create({
            userId: targetUser.userId,
            amount: amount,
            type: 'PACKAGE_ACTIVATION',
            transactionType: 'credit', 
            fromUserId: buyer.userId, 
            packageAmount: amount,
            description: `Package $${amount} activated by User ${buyer.userId} (${buyer.name})`,
            status: 'completed' 
        }));

        // 🚀 BLAZING FAST FIX: Execute all DB saves & histories at exactly the same time
        await Promise.all(dbOperations);

        // 🚀 SUPER FIX FOR "LEFT/RIGHT" TIME DELAY: 
        // Notice yahan humne 'await' HATA diya hai. 
        // Isse binary loop aaram se background mein count hota rahega aur API turant response degi.
        if (amount > 10 && targetUser.placementId && targetUser.position && targetUser.position !== 'NONE') {
            updateUplineBusiness(targetUser.placementId, targetUser.position, amount)
                .catch(err => console.error("Background Upline Update Failed:", err));
        }

        // Turant User ko Success Bhej Do!
        res.status(200).json({ 
            message: `Successfully activated $${amount} package for ${targetUser.name}!`,
            buyer: buyer 
        });

    } catch (error) {
        console.error("Buy Package Error:", error);
        res.status(500).json({ message: "Server error during package purchase." });
    }
});



router.post('/promo-dummy-topup', authMiddleware, async (req, res) => {
    try {
        // req.body se packageAmount aur password le rahe hain (taki normal buy-package se match kare)
        const { packageAmount, transactionPassword } = req.body;
        const amount = Number(packageAmount);

        if (amount < 10) return res.status(400).json({ message: "Minimum package amount is $10" });

        const currentUser = await User.findOne({ userId: req.user.userId });
        if (!currentUser) return res.status(404).json({ message: "User not found." });

        // 1. Transaction Password Check
        if (!transactionPassword || transactionPassword !== currentUser.transactionPassword) {
            return res.status(401).json({ message: "Incorrect transaction password!" });
        }

        // 🚀 MEGA LIST: First Names
        const firstNames = [
            "Aarav", "Abhay", "Abhinav", "Aditya", "Adarsh", "Akash", "Akhil", "Alok", "Aman", "Amar", "Amit", "Amol", "Anand", "Aniket", "Anirudh", "Ankit", "Ankur", "Anmol", "Ansh", "Anshul", "Anuj", "Anupam", "Apoorv", "Arjun", "Arnav", "Aryan", "Ashish", "Ashok", "Ashutosh", "Atul", "Ayush",
            "Balram", "Bharat", "Bhaskar", "Bhavish", "Bhupendra", "Brijesh", "Chaitanya", "Chandan", "Chetan", "Chirag", "Daksh", "Darpan", "Deepak", "Dev", "Devendra", "Dharmendra", "Dheeraj", "Dhruv", "Digvijay", "Dilip", "Dinesh", "Divyansh", "Gajendra", "Ganesh", "Gaurav", "Gautam", "Girish", "Gopal", "Gulshan", "Gunjit",
            "Harish", "Harsh", "Harshit", "Hemant", "Himanshu", "Hitesh", "Inder", "Ishaan", "Ishwar", "Jagdish", "Jaideep", "Jatin", "Jitendra", "Jugal", "Kabir", "Kailash", "Kamal", "Kapil", "Karan", "Kartik", "Kaushal", "Ketan", "Kiran", "Kishore", "Krishan", "Krunal", "Kuldeep", "Kunal", "Kushagra", "Laksh", "Lalit", "Lokesh",
            "Madhav", "Mahendra", "Mahesh", "Manas", "Manish", "Manit", "Manoj", "Mayank", "Milind", "Mohit", "Mukesh", "Mukul", "Nakul", "Naman", "Narendra", "Naresh", "Navneet", "Neeraj", "Nikhil", "Nilesh", "Nishant", "Nitin", "Om", "Omprakash", "Pankaj", "Parth", "Pawan", "Pradeep", "Prafull", "Pranjal", "Prateek", "Pratosh", "Praveen", "Prayas", "Puneet", "Pushkar",
            "Raghav", "Rahul", "Rajat", "Rajeev", "Rajesh", "Rajnish", "Rakesh", "Ram", "Ramesh", "Ranveer", "Ratan", "Ravi", "Ravindra", "Rishi", "Ritesh", "Rohan", "Rohit", "Ronak", "Rupesh", "Sachin", "Sagar", "Sahil", "Sajid", "Sameer", "Sandeep", "Sanjay", "Sanjeev", "Santosh", "Sarthak", "Satish", "Saurabh", "Shakti", "Shantanu", "Sharad", "Shashank", "Shikhar", "Shivam", "Shravan", "Shreyas", "Shubham", "Siddharth", "Somesh", "Subhash", "Sudhanshu", "Sudhir", "Sujit", "Sumit", "Sunil", "Suraj", "Suresh", "Surya", "Sushant", "Swapnil",
            "Tanmay", "Tarun", "Tejas", "Trilok", "Tushar", "Uday", "Udit", "Ujjwal", "Umang", "Utkarsh", "Vaibhav", "Varun", "Vicky", "Vidit", "Vijay", "Vikram", "Vimal", "Vinay", "Vineet", "Vinod", "Vipin", "Viplav", "Viraaj", "Vishal", "Vishnu", "Vishwa", "Vivek", "Vyom", "Yash", "Yogesh", "Yuvraj"
        ];

        // 🚀 MEGA LIST: Last Names
        const lastNames = [
            "Agarwal", "Ahluwalia", "Arora", "Babu", "Bajpai", "Bakshi", "Banerjee", "Bansal", "Bhardwaj", "Bhatia", "Bhatt", "Biswas", "Bose", "Chahal", "Chakraborty", "Chatterjee", "Chauhan", "Chhabra", "Choudhary", "Chopra", "Das", "Dayal", "Deshmukh", "Devi", "Dhillon", "Dixit", "Dubey", "Dutta", "Dwivedi", "Gadhavi", "Gandhi", "Garg", "Gautam", "Gill", "Goel", "Gokhale", "Goswami", "Gowda", "Gupta", "Iyer", "Jadeja", "Jain", "Jha", "Joshi", "Kapoor", "Kashyap", "Kaur", "Khanna", "Khatri", "Kulkarni", "Kumar", "Luthra", "Mahajan", "Malhotra", "Malik", "Maurya", "Mehra", "Mehta", "Menon", "Mishra", "Mittal", "Modi", "Mukherjee", "Nair", "Ojha", "Pandey", "Pant", "Parekh", "Paswan", "Patel", "Patil", "Pillai", "Prasad", "Puri", "Rai", "Rajput", "Rao", "Rastogi", "Rathore", "Rawat", "Reddy", "Sahni", "Saini", "Saksena", "Sarkar", "Saxena", "Sen", "Sethi", "Shah", "Sharma", "Shekhawat", "Shetty", "Shinde", "Shukla", "Singh", "Singhal", "Sinha", "Somani", "Soni", "Srivastava", "Talwar", "Taneja", "Thakur", "Tiwari", "Tripathi", "Trivedi", "Tyagi", "Upadhyay", "Varma", "Vashisht", "Verma", "Vyas", "Yadav"
        ];

        // Randomly name generate karo
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${randomFirstName} ${randomLastName}`;

        // 2. Unique ID Generation Loop (Ensure no clash with real or dummy DB)
        let dummyId;
        let isUnique = false;
        while (!isUnique) {
            dummyId = Math.floor(1000000 + Math.random() * 9000000); // 7-digit standard ID
            const existsInReal = await User.findOne({ userId: dummyId });
            const existsInDummy = await DummyUser.findOne({ userId: dummyId });
            if (!existsInReal && !existsInDummy) isUnique = true;
        }

        // 3. Dummy User Create Karo
        const newDummy = new DummyUser({
            userId: dummyId,
            name: fullName, 
            email: `demo_${dummyId}@financialsaarthi.com`, // Domain updated
            password: "demo_password_123",
            country: "India",
            mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`, // 10-digit random Indian number
            topUpAmount: amount,
            sponsorId: currentUser.userId
        });
        await newDummy.save();

        // 4. Record Dummy Transaction
        await DummyTransaction.create({
            userId: currentUser.userId,
            generatedId: dummyId,
            amount: amount,
            type: "promo", 
            description: `Promo package $${amount} generated for ID ${dummyId} (${fullName})`
        });

        res.status(200).json({ 
            success: true, 
            message: `Successfully generated $${amount} top-up for ${fullName} (${dummyId})`,
            generatedId: dummyId, 
            name: fullName 
        });

    } catch (err) {
        console.error("Promo Dummy Topup Error:", err);
        res.status(500).json({ message: "Server Error during promo topup." });
    }
});



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
// user routes ya jahan bhi aapka claim-task hai
router.post('/claim-task', async (req, res) => {
    try {
        const { userId, packageAmount } = req.body;

        const user = await User.findOne({ userId: Number(userId) });
        if (!user) return res.status(400).json({ message: "User record not found." });

        let totalMaxTasks = 0;
        const activePkgs = user.activePackages && user.activePackages.length > 0 
            ? user.activePackages 
            : (user.currentPackage ? [user.currentPackage] : []);

        if (activePkgs.length === 0 || !user.isActive) {
            return res.status(400).json({ message: "You do not have an active package." });
        }

        activePkgs.forEach(pkgAmount => {
            if (packagesConfig[pkgAmount]) {
                totalMaxTasks += packagesConfig[pkgAmount].maxTasks;
            }
        });

        const taskRate = 0.10; 

        if ((user.wallets.taskIncome || 0) + taskRate > user.totalCap) {
            user.isActive = false; 
            await user.save({ validateBeforeSave: false });
            return res.status(400).json({ 
                message: `Your total package limit ($${user.totalCap}) has been reached. Please purchase a new package.`            
            });
        }

        if (user.dailyVideosWatched >= totalMaxTasks) {
            return res.status(400).json({ 
                message: "Your daily quota for all packages has been completed. Please return tomorrow."            
            });
        }

        // 💰 INCOME CREDIT
        user.wallets.taskIncome = (user.wallets.taskIncome || 0) + taskRate;
        user.wallets.totalEarned = (user.wallets.totalEarned || 0) + taskRate;
        user.dailyVideosWatched += 1;
        user.wallets.totalTaskIncome = (user.wallets.totalTaskIncome || 0) + taskRate;

        if (user.dailyVideosWatched >= totalMaxTasks) {
            user.taskCompletedToday = true;
        }

        await user.save({ validateBeforeSave: false });

        // 🔴 Task History Update
        await TaskHistory.create({
            userId: user.userId,
            packageName: packageAmount ? `$${packageAmount} Package` : "Daily Ad Task",
            reward: taskRate
        });

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

// 3. Usi file me sabse niche ye naya Route add kar do (History page ke liye):
router.get('/task-history/:userId', async (req, res) => {
  try {
    const history = await TaskHistory.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});


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

 
// 🟢 GET DIRECT INCOME HISTORY
// 🟢 GET DIRECT INCOME HISTORY
router.get('/direct-income/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 🛡️ SAFETY FIX: Agar userId number nahi hai, toh yahin rok do
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const history = await Transaction.find({ 
            userId: Number(userId),
            type: 'DIRECT_INCOME' 
        }).sort({ createdAt: -1 }); 

        res.status(200).json(history);
    } catch (error) {
        console.error("Direct Income Fetch Error:", error);
        res.status(500).json({ message: "Server error while fetching direct income" });
    }
});

 

// 🟢 FETCH BINARY MATCHING HISTORY
router.get('/binary-history/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // User ki history find karo aur sabse nayi date (-1) upar dikhao
        const history = await BinaryHistory.find({ userId: Number(userId) })
                                           .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error("Binary History Fetch Error:", error);
        res.status(500).json({ message: "Server error while fetching binary history" });
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
// 💸 POST: P2P Wallet Transfer
router.post('/transfer', async (req, res) => {
    try {
        const { senderId, receiverId, amount, transactionPassword } = req.body;
        const transferAmount = Number(amount);

        // 🟢 FIX: Minimum $10 Transfer Limit Add Kiya Hai
        if (isNaN(transferAmount) || transferAmount < 10) {
            return res.status(400).json({ message: "Minimum transfer amount is $10" });
        }

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
// 🟢 DEPOSIT HISTORY ROUTE (Fixed Number Mismatch)
router.get('/deposit-history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 🟢 FIX 1: URL se aane wala userId String hota hai, usko Number me convert karna zaroori hai
        const numericUserId = Number(userId);

        if (isNaN(numericUserId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const history = await Deposit.find({ userId: numericUserId }).sort({ createdAt: -1 });
        
        res.status(200).json(history || []); 
    } catch (err) {
        console.error("Deposit History Error:", err);
        res.status(500).json({ message: "History fetch karne mein dikkat aayi" });
    }
});


// ==========================================================
// 🧹 TESTING DATA CLEANUP SCRIPT (RUN ONLY ONCE!)
// ==========================================================



// backend/routes/user.js ke andar


// ==========================================
// 1. 🟢 POST: Naya Withdrawal Request Daalna
// ==========================================
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, items, transactionPassword, walletAddress } = req.body;

        // 1. User Validation
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

        // 3. Process Multiple Wallets (Gross Calculation)
        let totalGrossAmount = 0;
        const withdrawItems = Array.isArray(items) ? items : [];
        
        if (withdrawItems.length === 0) {
            return res.status(400).json({ message: "Please select at least one wallet to withdraw." });
        }

        for (let item of withdrawItems) {
            // Frontend 'amount' bheje ya 'amt', dono handle karega
            const val = item.amount || item.amt || 0;
            const amount = Number(val);
            const walletId = item.source; 

            if (isNaN(amount) || amount <= 0) continue; 

            let currentBalance = (walletId === 'main_wallet') 
                ? user.walletBalance 
                : (user.wallets ? user.wallets[walletId] : 0);

            if (currentBalance === undefined || currentBalance < amount) {
                return res.status(400).json({ message: `Insufficient balance in ${walletId.replace('_', ' ')}` });
            }

            totalGrossAmount += amount;
        }

        // 4. Minimum Withdrawal Check
        if (totalGrossAmount < 5) { 
            return res.status(400).json({ message: "Minimum total withdrawal is $5" });
        }

        // 🔥 5. Fee Calculation (Exactly 10%)
        const feePercentage = 10;
        const feeAmount = (totalGrossAmount * feePercentage) / 100;
        const netAmount = totalGrossAmount - feeAmount;

        // 6. Deduct Balance from Wallets
        for (let item of withdrawItems) {
            const val = item.amount || item.amt || 0;
            const amount = Number(val);
            const walletId = item.source;

            if (amount > 0) {
                if (walletId === 'main_wallet') {
                    user.walletBalance -= amount;
                } else if (user.wallets) {
                    user.wallets[walletId] -= amount;
                }
            }
        }
        
        // Update user stats
        if (user.wallets) {
            user.wallets.totalWithdrawn = (user.wallets.totalWithdrawn || 0) + totalGrossAmount;
        }
        await user.save({ validateBeforeSave: false });

        // 🟢 7. SAVE TO WITHDRAWAL TABLE (Admin Dashboard ke liye)
        const primarySource = withdrawItems.length > 1 
            ? 'MULTI WALLET' 
            : String(withdrawItems[0]?.source || 'UNKNOWN').replace('_', ' ').toUpperCase();

        await Withdrawal.create({
            userId: user.userId,
            name: user.name,
            userDisplayId: String(user.userId),
            gross: totalGrossAmount, 
            fee: feeAmount,         
            net: netAmount,         
            amount: netAmount,      
            source: primarySource,  
            walletAddress: walletAddress || user.walletAddress,
            status: 'pending' 
        });

        // 🟢 8. SAVE TO TRANSACTION TABLE (User History ke liye)
        
        // 🛠️ YAHAN FIX KIYA HAI: 'directIncome' ko 'direct_income' mein badalna
        let walletTypeToSave = 'multi_wallet';
        if (withdrawItems.length === 1) {
            let sourceStr = withdrawItems[0].source || 'main_wallet';
            // Regex to convert camelCase to snake_case
            walletTypeToSave = sourceStr.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        }

        await Transaction.create({
            userId: user.userId,
            amount: totalGrossAmount,     
            grossAmount: totalGrossAmount,
            type: 'WITHDRAWAL',           
            transactionType: 'debit',
            walletType: walletTypeToSave, // 👈 Ab Mongoose error nahi dega
            description: `Withdrawal request for $${totalGrossAmount.toFixed(2)} (Net: $${netAmount.toFixed(2)} after 10% Fee)`,
            status: 'pending' 
        });

        res.status(200).json({ 
            message: `Withdrawal request for $${netAmount.toFixed(2)} submitted! ($${feeAmount.toFixed(2)} Fee deducted).`,
            user: user 
        });

    } catch (error) {
        console.error("Combined Withdraw Error:", error);
        res.status(500).json({ message: "Server error during withdrawal.", error: error.message });
    }
});

// ==========================================
// 2. 🟢 GET: Withdrawal History Dekhna
// ==========================================
// ==========================================
// 🟢 FIXED ROUTE: User Withdrawal History
// ==========================================
router.get('/withdrawals/:userId', async (req, res) => {
    try {
        const numericUserId = Number(req.params.userId);

        if (!numericUserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // 🔥 FIX: Direct 'Withdrawal' table se data uthao taaki admin se sync rahe
        // Agar Admin ne approve kiya, toh user ko turant approved dikhega!
        const withdrawals = await Withdrawal.find({ userId: numericUserId })
            .sort({ createdAt: -1 })
            .lean(); // .lean() fast response ke liye hota hai

        res.status(200).json(withdrawals);

    } catch (error) {
        console.error("User Withdrawal Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
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
                { userId: mongoose.isValidObjectId(id) ? id : null }, 
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
 
// 👥 ROUTE: POST /api/user/my-team
router.post('/my-team', async (req, res) => {
    try {
        const { userId, type } = req.body;
        const rootId = Number(userId);

        const userDoc = await User.findOne({ 
            $or: [{ userId: mongoose.isValidObjectId(userId) ? userId : null }, { userId: rootId }] 
        });

        if (!userDoc) return res.status(404).json({ message: "User not found" });

        // 🟢 1. DIRECT TEAM (Sponsor id ke base par)
        if (type === 'direct') {
            const directs = await User.find({ sponsorId: userDoc.userId }).sort({ createdAt: -1 });
            return res.status(200).json(directs);
        }

        // 🚀 SUPER FAST IN-MEMORY TREE LOGIC (For All, Left, Right)
        const allUsers = await User.find({}).lean();
        
        // Baccho ko unke Parent (PlacementId) ke under map karna
        const childrenMap = new Map(); 
        allUsers.forEach(u => {
            if (u.placementId) {
                if (!childrenMap.has(u.placementId)) childrenMap.set(u.placementId, []);
                childrenMap.get(u.placementId).push(u);
            }
        });

        // Helper Function: Kisi bhi User ID ka poora downline (flat array) nikalna
        const getFlatDownline = (startId) => {
            const result = [];
            const queue = [startId]; // BFS queue for fast traversal
            
            while (queue.length > 0) {
                const currentId = queue.shift();
                const children = childrenMap.get(currentId) || [];
                
                for (const child of children) {
                    result.push(child);
                    queue.push(child.userId);
                }
            }
            return result;
        };

        // 🟢 2. ALL TEAM (Poora Binary Downline)
        if (type === 'all') {
            const allTeam = getFlatDownline(userDoc.userId);
            // Naye log upar dikhane ke liye sort kar rahe hain
            allTeam.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return res.status(200).json(allTeam);
        }

        // 🟢 3. LEFT YA RIGHT TEAM
        if (type === 'left' || type === 'right') {
            const immediateChildren = childrenMap.get(userDoc.userId) || [];
            
            // Sabse pehle immediate left ya right bacche ko dhundo
            const targetChild = immediateChildren.find(c => c.position && c.position.toUpperCase() === type.toUpperCase());

            // Agar left/right me koi nahi juda hai, toh empty array bhej do
            if (!targetChild) {
                return res.status(200).json([]);
            }

            // Target child ka poora downline nikalo
            const downline = getFlatDownline(targetChild.userId);

            // Final Array (Root child + Uski poori team)
            const fullSideTeam = [targetChild, ...downline];
            
            fullSideTeam.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return res.status(200).json(fullSideTeam);
        }

        return res.status(400).json({ message: "Invalid type parameter" });

    } catch (err) {
        console.error("Team Fetch Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
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
// Upar jahan baaki imports hain, wahan authMiddleware zaroor import karna
// const authMiddleware = require('../middleware/authMiddleware'); 
// const Deposit = require('../models/Deposit'); // Ensure model is imported

router.get('/deposit-history/:userId', authMiddleware, async (req, res) => {
    try {
        // 🛡️ Extra Security (Optional but recommended):
        // Ensure user is fetching their own data
        // if (req.user.userId !== req.params.userId) {
        //     return res.status(403).json({ message: "Unauthorized access" });
        // }

        const history = await Deposit.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        
        res.status(200).json(history);
    } catch (err) { 
        console.error("Deposit History Error:", err);
        res.status(500).json({ message: "Internal Server Error" }); 
    }
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

// =======================================================
// 🟢 1. UPDATE PROFILE ROUTE (With Txn Password & 7-Digit ID)
// =======================================================
// =======================================================
// 🟢 UPDATE PROFILE ROUTE (Login Password ya Txn Password Dono Chalega)
// =======================================================
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, mobile, walletAddress, transactionPassword } = req.body;

        // 🛡️ 7-Digit ID check
        if (!userId || isNaN(userId)) return res.status(400).json({ message: "Invalid User ID" });

        const user = await User.findOne({ userId: Number(userId) });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // 🛡️ SMART PASSWORD CHECK
        let isMatch = false;

        // Condition 1: Check if it matches the Plain Transaction Password
        if (user.transactionPassword && user.transactionPassword === transactionPassword) {
            isMatch = true;
        } 
        
        // Condition 2: Agar Txn password match nahi hua, toh Main Login Password se check karo
        if (!isMatch && user.password) {
            const isLoginMatch = await bcrypt.compare(transactionPassword, user.password);
            if (isLoginMatch) {
                isMatch = true;
            }
        }

        // Agar dono mein se koi bhi match nahi hua toh 400 error do
        if (!isMatch) {
            return res.status(400).json({ message: "Aapka Confirm Password galat hai!" });
        }

        // Sab sahi hai, toh Profile update karo
        if (name) user.name = name;
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        if (walletAddress) user.walletAddress = walletAddress;

        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: "Server error during profile update." });
    }
});


// =======================================================
// 🟢 3. CHANGE LOGIN PASSWORD ROUTE (PLAIN TEXT)
// =======================================================
// =======================================================
// 🟢 1. CHANGE LOGIN PASSWORD ROUTE (Sirf Login badlega)
// =======================================================
// =======================================================
// 🟢 1. CHANGE LOGIN PASSWORD ROUTE
// =======================================================
router.put('/change-password/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        // 🛡️ 7-Digit ID check
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID format!" 
            });
        }

        const user = await User.findOne({ userId: Number(userId) });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User account not found!" 
            });
        }

        // 🟢 Plain Text Password Comparison
        if (user.password !== currentPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "The current login password you entered is incorrect!" 
            });
        }

        // Save new plain text password
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ 
            success: true, 
            message: "Login password updated successfully! 🔐" 
        });

    } catch (error) {
        console.error("Change Password Error:", error); 
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during password update." 
        });
    }
});


// =======================================================
// 🟢 2. CHANGE TRANSACTION PASSWORD ROUTE
// =======================================================
router.put('/change-txn-password/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldTxnPassword, newTxnPassword } = req.body;

        // 🛡️ 7-Digit ID check
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID format!" 
            });
        }

        const user = await User.findOne({ userId: Number(userId) });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User account not found!" 
            });
        }

        // 🛡️ Verify Current Transaction Password
        if (user.transactionPassword !== oldTxnPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "The current transaction password you entered is incorrect!" 
            });
        }

        // Save new transaction password
        user.transactionPassword = newTxnPassword;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ 
            success: true, 
            message: "Transaction password updated successfully! 🛡️" 
        });

    } catch (error) {
        console.error("Change Txn Password Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during transaction password update." 
        });
    }
});


module.exports = router;




 