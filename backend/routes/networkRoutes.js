const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🟢 HELPER 1: Kisi bhi branch ka total business nikalne ke liye
const getBranchTotalBusiness = async (userId) => {
    if (!userId) return 0;
    const user = await User.findOne({ userId: Number(userId) }).select('currentPackage userId');
    if (!user) return 0;

    let total = Number(user.currentPackage || 0);
    const children = await User.find({ placementId: user.userId }).select('userId');

    for (const child of children) {
        total += await getBranchTotalBusiness(child.userId);
    }
    return total;
};

// 🟢 HELPER 2: Ek single member ka detailed data nikalne ke liye
const getMemberData = async (userId) => {
    if (!userId || userId === 'NONE') return null;

    const user = await User.findOne({ userId: Number(userId) })
        .select('userId name isActive currentPackage binaryBusiness');
    
    if (!user) return null;

    // Direct niche wale dhundo (Binary Placement)
    const leftChild = await User.findOne({ 
        placementId: user.userId, 
        position: { $regex: /^LEFT$/i } 
    }).select('userId');
    
    const rightChild = await User.findOne({ 
        placementId: user.userId, 
        position: { $regex: /^RIGHT$/i } 
    }).select('userId');

    // Real-time Business Calculation
    const totalLeft = leftChild ? await getBranchTotalBusiness(leftChild.userId) : 0;
    const totalRight = rightChild ? await getBranchTotalBusiness(rightChild.userId) : 0;

    return {
        userId: user.userId,
        name: user.name,
        isActive: user.isActive,
        currentPackage: user.currentPackage || 0,
        carryForward: user.binaryBusiness || { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 },
        totalLeftBusiness: totalLeft,
        totalRightBusiness: totalRight,
        leftId: leftChild ? leftChild.userId : null,
        rightId: rightChild ? rightChild.userId : null
    };
};

// 🟢 HELPER 3: Recursive Tree Builder (Ye asli jaadu hai ✨)
// Ye function apne aap niche jata jayega jab tak maxDepth khatam na ho jaye
const buildRecursiveTree = async (userId, currentDepth, maxDepth) => {
    if (!userId || currentDepth > maxDepth) return null;

    const member = await getMemberData(userId);
    if (!member) return null;

    // Niche ki agli manzil par jao (Recursion)
    member.left = await buildRecursiveTree(member.leftId, currentDepth + 1, maxDepth);
    member.right = await buildRecursiveTree(member.rightId, currentDepth + 1, maxDepth);

    return member;
};

// 🌳 MAIN ROUTE: GET /api/network/tree/:userId
router.get('/tree/:userId', async (req, res) => {
    try {
        const rootId = req.params.userId;
        
        // 🚀 Hum Level 1 se shuru karke Level 5 tak ka pura tree ek saath mangwa rahe hain
        // Isse Level 4 wali IDs (jo pehle missing thi) ab saaf dikhengi
        const fullTree = await buildRecursiveTree(rootId, 1, 5);

        if (!fullTree) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ tree: fullTree });
    } catch (error) {
        console.error("Tree Recursive Load Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;