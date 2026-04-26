const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🛠️ Helper Function: User ka data nikaalne ke liye
const getMemberData = async (userId) => {
    if (!userId || userId === 'NONE') return null;

    const user = await User.findOne({ userId }).select('userId name isActive currentPackage binaryBusiness');
    if (!user) return null;

    // Is user ke niche kaun hai? (Left aur Right)
    const leftChild = await User.findOne({ placementId: user.userId, position: 'LEFT' }).select('userId');
    const rightChild = await User.findOne({ placementId: user.userId, position: 'RIGHT' }).select('userId');

    return {
        id: user.userId,
        name: user.name,
        isActive: user.isActive,
        currentPackage: user.currentPackage || 0,
        binaryBusiness: user.binaryBusiness || { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 },
        // Agle level ke liye phir se dhoondho (Recursion)
        leftId: leftChild ? leftChild.userId : null,
        rightId: rightChild ? rightChild.userId : null
    };
};

// 🌳 GET /api/network/tree/:userId
router.get('/tree/:userId', async (req, res) => {
    try {
        const rootId = req.params.userId;

        // Level 1: Root (Aap)
        const root = await getMemberData(rootId);
        if (!root) return res.status(404).json({ message: "User not found" });

        // Level 2: Aapke niche wale (L & R)
        root.left = await getMemberData(root.leftId);
        root.right = await getMemberData(root.rightId);

        // Level 3: Grandchildren (Aapke bachon ke bache)
        if (root.left) {
            root.left.left = await getMemberData(root.left.leftId);
            root.left.right = await getMemberData(root.left.rightId);
        }
        if (root.right) {
            root.right.left = await getMemberData(root.right.leftId);
            root.right.right = await getMemberData(root.right.rightId);
        }

        res.status(200).json({ tree: root });
    } catch (error) {
        console.error("Tree Load Error:", error);
        res.status(500).json({ message: "Server error while building tree" });
    }
});

module.exports = router;