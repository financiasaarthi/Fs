const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');

// Admin Login (URL will be /api/admin/login)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await User.findOne({ username, password, role: 'admin' });
    if (!admin) return res.status(401).json({ error: "Invalid Admin Credentials" });
    res.json({ message: "Admin login successful", user: admin });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Failed to fetch users" }); }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) { res.status(500).json({ error: "Failed to delete user" }); }
});

// Get All Withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const requests = await Withdrawal.find().sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: "Failed to fetch requests" }); }
});

// Approve/Reject Withdrawal
router.post('/withdrawals/action', async (req, res) => {
  try {
    const { requestId, action } = req.body; 
    const request = await Withdrawal.findById(requestId);
    
    if (request.status !== 'pending') return res.status(400).json({ error: "Already processed" });

    request.status = action;
    await request.save();

    if (action === 'rejected') {
      await User.findByIdAndUpdate(request.userId, { $inc: { walletBalance: request.amount } });
    }
    res.json({ message: `Request ${action} successfully.` });
  } catch (err) { res.status(500).json({ error: "Action failed" }); }
});

module.exports = router;