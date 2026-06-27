const cron = require('node-cron');
const User = require('../models/User'); // Apne User model ka path theek se check kar lena

// 🔴 1. EMERGENCY CRON: Aaj shaam 5:48 PM IST ke liye
cron.schedule('48 17 * * *', async () => {
    try {
        console.log("⏳ [IST 5:48 PM] Running EMERGENCY Task Reset...");
        
        await User.updateMany(
            {}, 
            { $set: { dailyVideosWatched: 0, taskCompletedToday: false } }
        );

        console.log("✅ [5:48 PM] All users tasks reset successfully for TODAY!");
    } catch (err) {
        console.error("❌ Cron Job Error:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});


// 🟢 2. REGULAR CRON: Roz raat 12:05 AM IST ke liye (Taaki kal se sab normal chale)
cron.schedule('5 0 * * *', async () => {
    try {
        console.log("⏳ [IST 12:05 AM] Running Daily Task Reset Cron Job...");
        
        await User.updateMany(
            {}, 
            { $set: { dailyVideosWatched: 0, taskCompletedToday: false } }
        );

        console.log("✅ [12:05 AM] All users tasks have been successfully reset!");
    } catch (err) {
        console.error("❌ Cron Job Error:", err);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});