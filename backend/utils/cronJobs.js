const cron = require('node-cron');
const User = require('../models/User'); // Apne User model ka path theek se check kar lena

// 🟢 12:05 AM IST Par chalne wala Cron Job ('5 0 * * *' = 12:05 AM)
cron.schedule('5 0 * * *', async () => {
    try {
        console.log("⏳ [IST 12:05 AM] Running Daily Task Reset Cron Job...");
        
        // Saare users ka daily limit 0 kar do aur status false kar do
        await User.updateMany(
            {}, 
            { 
                $set: { 
                    dailyVideosWatched: 0, 
                    taskCompletedToday: false 
                } 
            }
        );

        console.log("✅ All users tasks have been successfully reset!");
    } catch (err) {
        console.error("❌ Cron Job Error:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // 👈 YE SABSE ZAROORI HAI: Server kahin bhi ho, India time par chalega
});