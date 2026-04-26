// backend/routes/binaryRoutes.js
const express = require('express');
const router = express.Router();
const BinaryHistory = require('../models/BinaryHistory');

// 📊 GET /api/binary/history/:userId
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // User ki 7-digit ID se history dhoondhna
        const history = await BinaryHistory.find({ 
            userId: userId 
        }).sort({ createdAt: -1 });

        if (!history || history.length === 0) {
            return res.status(200).json([]); // Khali array bhejo agar history na ho
        }

        res.status(200).json(history);
    } catch (error) {
        console.error("Binary History Error:", error);
        res.status(500).json({ message: "History load karne mein server error" });
    }
});

module.exports = router;