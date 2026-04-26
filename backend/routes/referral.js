const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🌳 Recursive function to get full downline tree (Hierarchy)
async function getDownline(userId) {
  const children = await User.find({ sponsorId: userId }).select('userId name sponsorId isActive');
  const childrenWithSub = await Promise.all(children.map(async (child) => {
    const subtree = await getDownline(child.userId);
    return {
      userId: child.userId,
      name: child.name,
      isActive: child.isActive,
      children: subtree
    };
  }));
  return childrenWithSub;
}

// 🌳 GET Full Referral Tree (Frontend calls: /api/user/tree/:userId)
router.get('/tree/:userId', async (req, res) => {
  try {
    const userId = req.params.userId; // Type flexible rakhte hain
    const user = await User.findOne({ userId }).select('userId name');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const downline = await getDownline(user.userId);
    res.json({
      userId: user.userId,
      name: user.name,
      children: downline,
    });
  } catch (err) {
    console.error('Tree fetch error:', err);
    res.status(500).json({ message: 'Tree fetch error' });
  }
});

// 👥 Recursive function to get flat list of all members
async function getAllDownline(userId, depth = 1, result = []) {
  const referrals = await User.find({ sponsorId: userId });
  for (const user of referrals) {
    // Level tracking ke saath result me push karein
    result.push({ ...user._doc, level: depth });
    await getAllDownline(user.userId, depth + 1, result);
  }
  return result;
}

// 👥 All Team (Frontend calls: /api/user/all-team/:userId)
// 🟢 FIX: Route ka naam badal kar '/all-team' kiya
router.get('/all-team/:userId', async (req, res) => {
  try {
    const allTeam = await getAllDownline(req.params.userId);
    // 🟢 FIX: Direct array bhej rahe hain kyunki frontend .map() kar raha hoga
    res.json(allTeam); 
  } catch (err) {
    console.error('All team error:', err);
    res.status(500).json({ message: 'All team fetch error' });
  }
});

module.exports = router;