require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Setting = require('../models/Setting'); 
const sanitizeUser = require('../utils/sanitizeUser');
// const sendEmail = require('../utils/sendEmail'); // 🔴 EMAIL IMPORT BAND KIYA
const checkFeature = require('../middleware/checkFeatureEnabled');
const DummyUser = require('../models/DummyUser.js');
const LoginHistory = require('../models/LoginHistory'); 
const IpRule = require('../models/IpRule'); 
const BlockedDevice = require('../models/BlockedDevice'); 
const { bot } = require('../utils/telegramBot');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getClientIP = (req) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || '127.0.0.1';
    if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');
    return ip;
};

const generateUserId = async () => {
  let id;
  let exists = true;
  while (exists) {
    id = Math.floor(1000000 + Math.random() * 9000000);
    const existsInReal = await User.exists({ userId: id });
    const existsInDummy = await DummyUser.exists({ userId: id });
    if (!existsInReal && !existsInDummy) exists = false;
  }
  return id;
};

// ====================== REGISTER ======================
router.post('/register', checkFeature('allowRegistrations'), async (req, res) => {
  try {
    // 🟢 1. req.body mein 'confirmPassword' ko add kiya
    const { name, mobile, email, country, password, confirmPassword, sponsorId, deviceId, position, placementId } = req.body;
    const userIP = getClientIP(req);

    const settings = await Setting.findOne() || { allowRegistrations: true }; 
    if (!settings.allowRegistrations) return res.status(400).json({ message: "Registration is currently closed by Admin." });

    // 🟢 2. Password aur Confirm Password ka Match Check
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password aur Confirm Password match nahi ho rahe hain!" });
    }

    // 🟢 3. Sirf @gmail.com allow karne ka rule (Pehle se tha, waisa hi rakha hai)
    if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Only @gmail.com emails are accepted.' });
    }
    
    if (!sponsorId) return res.status(400).json({ message: 'Sponsor ID is compulsory.' });

    let sponsorExists = await User.findOne({ userId: parseInt(sponsorId) });
    if (!sponsorExists) sponsorExists = await DummyUser.findOne({ userId: parseInt(sponsorId) });
    if (!sponsorExists) return res.status(400).json({ message: 'Invalid Sponsor ID.' });
    if (sponsorExists.isSponsorDeactivated) return res.status(403).json({ message: 'Policy violation: Deactivated sponsor.' });

    // 🟢 4. Ek Email / Mobile se sirf Ek Account banne ka check (Waisa hi rakha hai)
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile: mobile }] });
    if (existingUser) {
        return res.status(400).json({ message: existingUser.mobile === mobile ? 'Ye Mobile number pehle se registered hai.' : 'Ye Email pehle se registered hai.' });
    }

    // IP Check
    const isLocalIP = userIP === '127.0.0.1' || userIP === '::1';
    if (!isLocalIP) {
        const rule = await IpRule.findOne({ ipAddress: userIP });
        if (rule && rule.isBlocked) return res.status(403).json({ message: "Access Denied: Your IP has been blocked." });
        const allowedLimit = rule ? rule.limit : 5;
        const totalRegisteredFromIP = await User.countDocuments({ ipAddress: userIP });
        if (totalRegisteredFromIP >= allowedLimit) return res.status(403).json({ message: `Limit reached for this IP.` });
    }

    // Device Check
    if (deviceId) {
        const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
        if (isDeviceBlocked) return res.status(403).json({ message: "Access Denied: Device blocked." });
        const accountsOnDevice = await User.countDocuments({ deviceId });
        if (accountsOnDevice >= 2) return res.status(403).json({ message: "Limit Exceeded for this device." });
    }

    // 🔴 bcrypt hash ko hata diya gaya hai. Ab seedha generateUserId() call hoga.
    const userId = await generateUserId();

    const user = new User({
      userId, 
      username: name || 'User', 
      name, 
      mobile, 
      email: email.toLowerCase(), // Email ko lowercase mein save karna safe hota hai
      country: country || 'Unknown',
      password: password, // 🟢 5. Password ab PLAIN TEXT mein save hoga
      transactionPassword: password, 
      sponsorId: parseInt(sponsorId),
      placementId: placementId ? parseInt(placementId) : parseInt(sponsorId), 
      position: position || 'LEFT', 
      role: 'user',
      ipAddress: userIP,
      deviceId: deviceId || null 
    });

    await user.save();

    // EMAIL SENDING BYPASSED HERE
    console.log(`✅ User ${userId} Registered. (Email sending skipped for local dev)`);

    res.status(201).json({ message: 'User registered successfully.', userId: user.userId, name: user.name, password: user.password });

  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ====================== LOGIN ======================
router.post('/login', async (req, res) => {
  try {
    const { userId, password, deviceId } = req.body;
    const userIP = getClientIP(req);

    // 1. User dhoondho
    const user = await User.findOne({ userId });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 2. Security Checks (IP aur Role check)
    if (user.role !== 'admin') {
        const isLocalIP = userIP === '127.0.0.1' || userIP === '::1';
        if (!isLocalIP) {
            const rule = await IpRule.findOne({ ipAddress: userIP });
            if (rule && rule.isBlocked) return res.status(403).json({ message: "IP Blocked." });
            
            const allowedLimit = rule ? rule.limit : 5;
            const uniqueUsersOnThisIP = await LoginHistory.distinct('userId', { ipAddress: userIP });
            
            if (uniqueUsersOnThisIP.length >= allowedLimit && !uniqueUsersOnThisIP.includes(user.userId)) {
                return res.status(403).json({ message: `IP Limit reached.` });
            }
        }
    }

    // 3. Device Block Check
    if (deviceId) {
        const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
        if (isDeviceBlocked) return res.status(403).json({ message: "Device Blocked." });        
    }

    // 4. Maintenance/Login Disable Check
    const settings = await Setting.findOne();
    if (settings) {
        if (settings.maintenanceMode && user.role !== 'admin') return res.status(503).json({ message: 'Maintenance Mode.' });
        if (!settings.allowLogin && user.role !== 'admin') return res.status(403).json({ message: 'Login is disabled.' });
    }

    // 🟢 FIX 1: Plain Password Comparison
    // Ab bcrypt use nahi hoga, seedha string match hoga
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Account Block Check
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked.' });

    // 6. User Login Info Update
    user.ipAddress = userIP; 
    if (deviceId) user.deviceId = deviceId;
    await user.save();

    // 🟢 FIX 2: Token Expiry (15m se badha kar 30 days kar diya)
    // Isse baar-baar logout hone wali problem khatam ho jayegi
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    // 7. Login History Create
    try { 
        await LoginHistory.create({ 
            userId: user.userId, 
            name: user.name, 
            mobile: user.mobile, 
            ipAddress: userIP 
        }); 
    } catch (e) {
        console.log("Login history log error");
    }

    // 8. Final Response
    res.json({ 
        message: 'Login successful', 
        token, 
        user: sanitizeUser(user) 
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================== FORGOT PASSWORD ======================
router.post('/forgot-password', checkFeature(), async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // 🔴 EMAIL SENDING BYPASSED HERE
    console.log(`🔐 Password Reset Link for ${userId}: ${resetLink}`);

    // 🟢 MAZEDAR CHEEZ: Hum link directly response me bhej rahe hain testing ke liye!
    res.json({ 
        message: 'Password reset link generated (Check Console or below data)', 
        testLink: resetLink // Use this link in your browser to test
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ====================== RESET PASSWORD ======================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.transactionPassword = newPassword; 
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    // 🔴 EMAIL SENDING BYPASSED HERE
    console.log(`✅ Password successfully reset for user ${user.userId}`);

    res.json({
      message: 'Password reset successful',
      userId: user.userId,
      password: newPassword, 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;