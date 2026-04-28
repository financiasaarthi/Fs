const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🌳 MAIN ROUTE: GET /api/network/tree/:userId
router.get('/tree/:userId', async (req, res) => {
    try {
        const rootId = Number(req.params.userId);

        // 🚀 STEP 1: ONE-SHOT DB QUERY (Super Fast)
        // Hum database se sirf zaroori fields utha rahe hain ek hi baar mein
        // .lean() lagane se data Mongoose object ki jagah plain JSON mein aata hai, jo 10x fast hota hai
        const allUsers = await User.find({}).select('userId name isActive currentPackage binaryBusiness placementId position').lean();

        // 🚀 STEP 2: BUILD FAST LOOKUP MAPS (O(1) Time Complexity)
        const userMap = new Map();
        const childrenMap = new Map();

        allUsers.forEach(u => {
            userMap.set(u.userId, u);
            // Apne aap bacchon ko unke parent ke map mein daal do
            if (u.placementId) {
                if (!childrenMap.has(u.placementId)) {
                    childrenMap.set(u.placementId, []);
                }
                childrenMap.get(u.placementId).push(u);
            }
        });

        // 🟢 HELPER 1: Memory se total business nikalna (0 DB Queries!)
        const calculateBusinessMem = (userId) => {
            if (!userId) return 0;
            const user = userMap.get(userId);
            if (!user) return 0;

            let total = Number(user.currentPackage || 0);
            const children = childrenMap.get(userId) || [];
            
            for (const child of children) {
                total += calculateBusinessMem(child.userId);
            }
            return total;
        };

        // 🟢 HELPER 2: Ek member ka data banana
        const buildNodeData = (userId) => {
            const user = userMap.get(userId);
            if (!user) return null;

            const children = childrenMap.get(userId) || [];
            const leftChild = children.find(c => c.position && c.position.toUpperCase() === 'LEFT');
            const rightChild = children.find(c => c.position && c.position.toUpperCase() === 'RIGHT');

            return {
                userId: user.userId,
                name: user.name,
                isActive: user.isActive,
                currentPackage: user.currentPackage || 0,
                carryForward: user.binaryBusiness || { leftVolume: 0, rightVolume: 0, totalPairsMatched: 0 },
                totalLeftBusiness: leftChild ? calculateBusinessMem(leftChild.userId) : 0,
                totalRightBusiness: rightChild ? calculateBusinessMem(rightChild.userId) : 0,
                leftId: leftChild ? leftChild.userId : null,
                rightId: rightChild ? rightChild.userId : null
            };
        };

        // 🟢 HELPER 3: Recursive Tree Builder (In-Memory)
        const buildRecursiveTree = (userId, currentDepth, maxDepth) => {
            if (!userId || currentDepth > maxDepth) return null;

            const member = buildNodeData(userId);
            if (!member) return null;

            member.left = buildRecursiveTree(member.leftId, currentDepth + 1, maxDepth);
            member.right = buildRecursiveTree(member.rightId, currentDepth + 1, maxDepth);

            return member;
        };

        // 🚀 STEP 3: BUILD THE FINAL TREE (Levels 1 to 5)
        const fullTree = buildRecursiveTree(rootId, 1, 5);

        if (!fullTree) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ tree: fullTree });

    } catch (error) {
        console.error("🚀 Tree Fast Load Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;