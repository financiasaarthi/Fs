const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🟢 NEW HELPER: Kisi bhi user ke niche ka TOTAL Business nikalne ke liye (Recursive)
// Ye function us user ka khud ka package + uske niche ke saare logo ka package sum karega.
const getBranchTotalBusiness = async (userId) => {
    if (!userId) return 0;

    // 1. Is user ka apna current package lo
    const user = await User.findOne({ userId: Number(userId) }).select('currentPackage userId');
    if (!user) return 0;

    let total = Number(user.currentPackage || 0);

    // 2. Iske direct niche wale dhoondho
    const children = await User.find({ placementId: user.userId }).select('userId');

    // 3. Un bacho ke niche ka business bhi recursively add karo
    for (const child of children) {
        total += await getBranchTotalBusiness(child.userId);
    }

    return total;
};

// 🛠️ Updated Helper: Member data with "Total" vs "Carry Forward"
const getMemberData = async (userId) => {
    if (!userId || userId === 'NONE') return null;

    const user = await User.findOne({ userId: Number(userId) }).select('userId name isActive currentPackage binaryBusiness');
    if (!user) return null;

    // Direct children for tree structure
    const leftChild = await User.findOne({ placementId: user.userId, position: { $regex: /^LEFT$/i } }).select('userId');
    const rightChild = await User.findOne({ placementId: user.userId, position: { $regex: /^RIGHT$/i } }).select('userId');

    // 🟢 CALCULATION: Yahan hum real-time calculate kar rahe hain total business
    // Left side ka total aur Right side ka total (No Matching/No Flushing here)
    const totalLeft = leftChild ? await getBranchTotalBusiness(leftChild.userId) : 0;
    const totalRight = rightChild ? await getBranchTotalBusiness(rightChild.userId) : 0;

    return {
        userId: user.userId,
        name: user.name,
        isActive: user.isActive,
        currentPackage: user.currentPackage || 0,
        // binaryBusiness se sirf carry-forward aur matched uthao
        carryForward: user.binaryBusiness || { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 },
        // Naye fields jo humne calculate kiye
        totalLeftBusiness: totalLeft,
        totalRightBusiness: totalRight,
        leftId: leftChild ? leftChild.userId : null,
        rightId: rightChild ? rightChild.userId : null
    };
};

// 🌳 GET /api/network/tree/:userId
router.get('/tree/:userId', async (req, res) => {
    try {
        const rootId = req.params.userId;
        const root = await getMemberData(rootId);
        if (!root) return res.status(404).json({ message: "User not found" });

        // Level 2
        root.left = await getMemberData(root.leftId);
        root.right = await getMemberData(root.rightId);

        // Level 3
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
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;