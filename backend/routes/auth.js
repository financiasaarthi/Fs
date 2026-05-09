require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const bcrypt = require('bcryptjs'); // You disabled this for plain text

const User = require('../models/User');
const Setting = require('../models/Setting'); 
const sanitizeUser = require('../utils/sanitizeUser');
const checkFeature = require('../middleware/checkFeatureEnabled');
const DummyUser = require('../models/DummyUser.js');
const LoginHistory = require('../models/LoginHistory'); 
const IpRule = require('../models/IpRule'); 
const BlockedDevice = require('../models/BlockedDevice'); 
const { bot } = require('../utils/telegramBot');
const Transaction = require('../models/Transaction'); // path apne hisab se check kar lena
// 🔥 NEW IMPORTS FOR OTP AND EMAIL
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
// Auto-Switch for Local and Live Server
const FRONTEND_URL = process.env.FRONTEND_URL 
    || (process.env.NODE_ENV === 'production' ? 'https://financialsaarthi.live' : 'http://localhost:5173');
// 🟢 PACKAGE CONFIGURATION
const packages = {
  10: { dailyTasks: 2, taskRate: 0.1, dailyIncome: 0.2, maxEarning: 20 },
  30: { dailyTasks: 6, taskRate: 0.1, dailyIncome: 0.6, maxEarning: 75 },
  50: { dailyTasks: 10, taskRate: 0.1, dailyIncome: 1.0, maxEarning: 150 },
  100: { dailyTasks: 20, taskRate: 0.1, dailyIncome: 2.0, maxEarning: 400 },
  500: { dailyTasks: 50, taskRate: 0.1, dailyIncome: 5.0, maxEarning: 2500 }
};

// 🟢 NODEMAILER CONFIGURATION (NAMECHEAP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

const findFinalPlacement = async (parentId, side) => {
    const child = await User.findOne({ placementId: parentId, position: side }).select('userId');
    if (!child) return parentId;
    return await findFinalPlacement(child.userId, side);
};

// ====================== SEND OTP ROUTE ======================
// ====================== SEND OTP ======================
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // 1. Duplicate Check
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        console.log(`⚠️ OTP Failed: Email ${email} is already registered.`);
        return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save/Update OTP in DB
    await Otp.findOneAndDelete({ email: email.toLowerCase() });
    await new Otp({ email: email.toLowerCase(), otp }).save();

    // 4. Send Email
    const mailOptions = {
      from: `"Financial Saarthi Support" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: 'Your Registration OTP - Financial Saarthi',
      html: `<h3>Welcome to Financial Saarthi!</h3>
             <p>Your OTP for registration is: <strong style="font-size: 24px;">${otp}</strong></p>
             <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP successfully sent to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully to your email.' });

  } catch (error) {
    console.error('❌ OTP Email Server Error:', error.message);
    // Yeh error frontend pe jayega (500), aur tabhi Emergency OTP dikhega
    res.status(500).json({ message: 'Failed to send OTP. Email Server Busy.' });
  }
});

// ====================== REGISTER ======================
router.post('/register', checkFeature('allowRegistrations'), async (req, res) => {
  try {
    const { name, mobile, email, country, password, confirmPassword, sponsorId, deviceId, position, placementId, otp } = req.body;
    const userIP = getClientIP(req);

    const settings = await Setting.findOne() || { allowRegistrations: true }; 
    if (!settings.allowRegistrations) return res.status(400).json({ message: "Registration is closed." });

    if (!otp) return res.status(400).json({ message: "OTP is required!" });
    if (password !== confirmPassword) return res.status(400).json({ message: "Password does not match!" });
    if (!sponsorId) return res.status(400).json({ message: 'Sponsor ID is compulsory.' });

    // 1. Verify OTP (🚨 EMERGENCY BYPASS)
    let validOtp = null;
    
    if (otp === "123456") {
        validOtp = { _id: "bypass_otp" }; 
        console.log(`⚠️ User ${email} registered using Emergency Master OTP (123456).`);
    } else {
        validOtp = await Otp.findOne({ email: email.toLowerCase(), otp });
        if (!validOtp) return res.status(400).json({ message: "Invalid or Expired OTP!" });
    }

    // 2. Sponsor Check
    let sponsorExists = await User.findOne({ userId: parseInt(sponsorId) });
    if (!sponsorExists) sponsorExists = await DummyUser.findOne({ userId: parseInt(sponsorId) });
    if (!sponsorExists) return res.status(400).json({ message: 'Invalid Sponsor ID.' });

    // 3. Duplicate Check
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile: mobile }] });
    if (existingUser) return res.status(400).json({ message: 'Email or Mobile already registered.' });

    // 4. Auto-Spillover Logic
    const targetSide = position || 'LEFT';
    const startNode = placementId ? parseInt(placementId) : parseInt(sponsorId);
    const finalPlacementId = await findFinalPlacement(startNode, targetSide);

    const userId = await generateUserId();

    // 5. Create User WITH $10 FREE PACKAGE
    const user = new User({
      userId, 
      username: name || 'User', 
      name, 
      mobile, 
      email: email.toLowerCase(),
      country: country || 'Unknown',
      password: password, 
      transactionPassword: password, 
      sponsorId: parseInt(sponsorId),
      placementId: finalPlacementId, 
      position: targetSide, 
      role: 'user',
      ipAddress: userIP,
      deviceId: deviceId || null,

      isActive: true,
      activePackages: [10],               
      currentPackage: 10,                 
      totalCap: 20,                       
      activationDate: new Date(),
      
      packageAmount: 10,
      dailyIncome: packages[10].dailyIncome,
      totalTasksAvailable: packages[10].dailyTasks,
      maxEarningLimit: packages[10].maxEarning
    });

    await user.save();

    // 6. Transaction Record
    try {
        const transaction = new Transaction({
            userId: user.userId,
            type: 'PACKAGE_ACTIVATION', 
            transactionType: 'credit',
            walletType: 'main_wallet',
            amount: 10,
            txHash: `FREE-${user.userId}-${Date.now()}`,
            description: "Free $10 Registration Bonus Package",
            status: "completed"
        });
        await transaction.save();
    } catch (txErr) {
        console.error("❌ Free Package Transaction Record Error:", txErr);
    }

    // 7. Delete OTP
    if (validOtp._id !== "bypass_otp") {
        await Otp.deleteOne({ _id: validOtp._id });
    }

    res.status(201).json({ 
        message: 'User registered successfully. $10 Package Activated!', 
        userId: user.userId, 
        placementId: user.placementId, 
        position: user.position,
        package: 10
    });

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

    const user = await User.findOne({ userId });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

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

    if (deviceId) {
        const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
        if (isDeviceBlocked) return res.status(403).json({ message: "Device Blocked." });        
    }

    const settings = await Setting.findOne();
    if (settings) {
        if (settings.maintenanceMode && user.role !== 'admin') return res.status(503).json({ message: 'Maintenance Mode.' });
        if (!settings.allowLogin && user.role !== 'admin') return res.status(403).json({ message: 'Login is disabled.' });
    }

    // Plain text comparison
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked.' });

    user.ipAddress = userIP; 
    if (deviceId) user.deviceId = deviceId;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

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

    res.json({ message: 'Login successful', token, user: sanitizeUser(user) });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================== FORGOT PASSWORD ======================
// ====================== FORGOT PASSWORD (REAL EMAIL) ======================
router.post('/forgot-password', checkFeature(), async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.email) return res.status(400).json({ message: 'No registered email found for this user.' });

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour validity
    await user.save();

    // Create the frontend reset link
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // 📧 SEND REAL EMAIL TO USER
    const mailOptions = {
      from: `"FinSaarthi Support" <${process.env.EMAIL_USER}>`,
      to: user.email.toLowerCase(),
      subject: 'Password Reset Request - FinSaarthi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
            <h2 style="color: #1e293b; text-align: center;">Reset Your Password 🔑</h2>
            <p style="color: #475569; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your account (User ID: <strong>${user.userId}</strong>).</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #2563EB; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Click Here to Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">This link is valid for 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Password Reset Email sent successfully to ${user.email}`);

    // Frontend ko sirf success message bhejna hai, link nahi
    res.json({ message: 'Password reset link sent successfully!' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error while sending email.' });
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

    user.password = newPassword;
    user.transactionPassword = newPassword; 
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log(`✅ Password successfully reset for user ${user.userId}`);
    res.json({ message: 'Password reset successful', userId: user.userId, password: newPassword });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;