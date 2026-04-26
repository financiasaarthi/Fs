const mongoose = require("mongoose");
const Admin = require("./models/Admin"); 
const crypto = require("crypto"); 
require("dotenv").config();

const plainAdminId = process.env.SETUP_ADMIN_ID;
const plainPassword = process.env.SETUP_ADMIN_PASS;

if (!plainAdminId || !plainPassword || !process.env.MONGO_URI) {
    console.error("❌ Error: .env file check karein (URI, ID, PASS missing hai)!");
    process.exit(1);
}

// 🛠️ FIX 1: Connection syntax ekdum simple rakhein
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ MongoDB connected successfully!");
        
        // 🛠️ FIX 2: Connection hone ke BAAD hi function call karein
        await resetAndCreateSecureAdmin(); 
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

async function resetAndCreateSecureAdmin() {
    try {
        console.log("⏳ Processing... please wait.");
        
        // Purana data saaf
        await Admin.deleteMany({});
        console.log("🗑️ Purana admin data saaf.");

        // ID Hashing (SHA-256)
        const hashedAdminId = crypto.createHash("sha256").update(plainAdminId).digest("hex");

        const admin = new Admin({ 
            adminId: hashedAdminId,  
            password: plainPassword, // Model ka hook ise encrypt karega
            role: "admin"
        });

        await admin.save();

        console.log(`-----------------------------------`);
        console.log(`✅ Admin Created Successfully!`);
        console.log(`🔑 ID to use in Login: ${plainAdminId}`);
        console.log(`-----------------------------------`);
        
        process.exit(0);

    } catch (err) {
        console.error("❌ Error while creating admin:", err.message);
        process.exit(1);
    }
}