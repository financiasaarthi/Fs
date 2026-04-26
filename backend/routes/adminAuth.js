const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // 👈 SHA-256 ke liye
const Admin = require('../models/Admin');
const router = express.Router();

// 🔐 Admin Login
router.post("/login", async (req, res) => {
    const { adminId, password } = req.body;

    try {
        // 1. User ki ID ko SHA-256 hash karo (Jaisa Setup Script me kiya tha)
        const hashedInputId = crypto.createHash("sha256").update(adminId).digest("hex");

        // 2. Database me wo Hash dhoondo
        const admin = await Admin.findOne({ adminId: hashedInputId });

        if (!admin) {
            return res.status(401).json({ message: "Access Denied: Invalid Admin Identity" });
        }

        // 3. Model ka method use karke password compare karo
        // Ye aapke Admin.js me jo comparePassword function hai usey call karega
        const isMatch = await admin.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Access Denied: Invalid Secret Key" });
        }

        // 4. Token generate karo
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "5h" } // 300 minutes
        );

        res.json({ success: true, token });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Internal System Error" });
    }
});

module.exports = router;