require('dotenv').config(); // .env se MONGO_URI lene ke liye
const mongoose = require('mongoose');

// Apne User model ka sahi path daalna yahan
const User = require('./models/User'); 

async function removeFreePackages() {
    try {
        // 1. Database se connect karo
        console.log("⏳ Database se connect ho raha hai...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected!");

        // 🟢 DATE FILTER: 30 June 2026 ke raat 11:59:59 tak ka time
        const targetDate = new Date('2026-06-30T23:59:59.999Z');

        // Ye filter banaya jisme dono conditions hain:
        // 1. Package sirf 10 hona chahiye
        // 2. Joining date 30 June ya usse pehle ki honi chahiye ($lte = less than or equal)
        const query = { 
            currentPackage: 10, 
            createdAt: { $lte: targetDate } 
        };

        // 2. Check karo kitne users hain
        const usersToUpdate = await User.countDocuments(query);
        
        if (usersToUpdate === 0) {
            console.log("🎉 Koi bhi user nahi mila jiska package sirf $10 ho aur usne 30 June ya usse pehle join kiya ho.");
            process.exit(0);
        }

        console.log(`⚠️ Aise ${usersToUpdate} users mile hain (30 June tak ke) jinka package sirf $10 hai.`);

        // 3. Update command chalao
        // Ye command 30 June ke baad walo ko touch nahi karegi!
        const result = await User.updateMany(
            query, 
            { 
                $set: { 
                    currentPackage: 0, 
                    isActive: false 
                } 
            }
        );

        console.log(`✅ Success! ${result.modifiedCount} purane users ka package 0 kar diya gaya hai.`);
        
    } catch (error) {
        console.error("❌ Kuch gadbad ho gayi:", error);
    } finally {
        // 4. Connection close kar do
        mongoose.connection.close();
        console.log("🔌 Database connection closed.");
        process.exit(0);
    }
}

// Function call
removeFreePackages();