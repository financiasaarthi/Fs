const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// ==========================================
// 🟢 HELPER FUNCTION: Auto-Spillover (Sahi Placement ID dhoondhna)
// ==========================================
const findPlacementNode = async (sponsorId, position) => {
    let currentNode = await User.findOne({ userId: sponsorId });
    if (!currentNode) return null;

    // Tree mein neeche tak jao jab tak khali jagah na mil jaye
    while (true) {
        const childNode = await User.findOne({ 
            placementId: currentNode.userId, 
            position: position.toUpperCase() 
        });

        if (!childNode) {
            return currentNode; // Khali jagah mil gayi!
        }
        
        currentNode = childNode; // Agar bhara hai, toh aur neeche jao
    }
};

// ==========================================
// 🚀 1. USER REGISTRATION API (7-Digit ID & Auto-Placement)
// ==========================================
// ==========================================
// 🚀 1. USER REGISTRATION API (7-Digit ID & Auto-Placement)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        // 🟢 NAYA: Yahan 'mobile' aur 'country' ko req.body se receive kiya hai
        const { name, email, mobile, country, password, sponsorId, position } = req.body;

        // Validation check mein bhi mobile aur country add kar diya hai
        if (!name || !email || !mobile || !country || !password || !sponsorId || !position) {
            return res.status(400).json({ message: "Saare fields bharna zaroori hai!" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Ye Email pehle se registered hai." });
        }

        let placementNode = null;
        let finalPlacementId = sponsorId;

        // 🟢 Sponsor & Placement Check
        if (sponsorId !== '1000000') {
            const sponsor = await User.findOne({ userId: sponsorId });
            if (!sponsor) {
                return res.status(404).json({ message: "Sponsor ID galat hai ya exist nahi karti." });
            }
            
            // Sahi placement dhoondho (Spillover Logic)
            placementNode = await findPlacementNode(sponsorId, position);
            if (placementNode) {
                finalPlacementId = placementNode.userId;
            }
        } else {
            // Admin (1000000) ke liye bhi placement logic
            placementNode = await findPlacementNode('1000000', position);
            if (placementNode) {
                finalPlacementId = placementNode.userId;
            }
        }

        // Generate 7-Digit Numeric ID
        const newUserId = Math.floor(1000000 + Math.random() * 9000000).toString();

        const newUser = new User({
            userId: newUserId,
            username: newUserId, 
            name: name,
            email: email.toLowerCase(),
            mobile: mobile,       // 👈 NAYA: Yahan mobile save ho raha hai
            country: country,     // 👈 NAYA: Yahan country save ho raha hai
            password: password, 
            sponsorId: sponsorId,
            placementId: finalPlacementId, 
            parentPlacementId: placementNode ? placementNode._id : null, 
            position: position.toUpperCase(),
            isActive: false, 
            currentPackage: null,
            walletBalance: 0,
            wallets: { taskIncome: 0, directIncome: 0, matchingIncome: 0, totalEarned: 0 },
            dailyVideosWatched: 0,
            taskCompletedToday: false
        });

        const savedUser = await newUser.save();

        // 🟢 Parent Node update karna (Tree Link karna)
        if (placementNode) {
            if (position.toUpperCase() === 'LEFT') {
                placementNode.leftChild = savedUser._id;
            } else {
                placementNode.rightChild = savedUser._id;
            }
            await placementNode.save();
        }

        res.status(201).json({ 
            message: "Registration Successful!", 
            user: {
                userId: savedUser.userId,
                name: savedUser.name,
                placementId: savedUser.placementId
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error, please try again." });
    }
});

// ==========================================
// 🚀 2. USER LOGIN API (By User ID)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ message: "User ID aur Password dono zaroori hain!" });
        }

        const user = await User.findOne({ userId: userId });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Galat User ID ya Password." });
        }

        res.status(200).json({ message: "Login successful", user });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error, please try again." });
    }
});

module.exports = router;