const cron = require('node-cron');
const User = require('../models/User'); // Apne User model ka path theek se check kar lena

// Ek function bana liya taaki code baar-baar na likhna pade
const resetDailyTasks = async (timeLabel) => {
    try {
        console.log(`⏳ [${timeLabel}] Running Task Reset...`);
        
        // 🔥 SMART FIX: Sirf unko update karo jinka counter > 0 hai ya taskCompletedToday true hai.
        // Isse Mongoose aur Database par load nahi padega aur CPU block nahi hoga.
        const result = await User.updateMany(
            { 
                $or: [
                    { dailyVideosWatched: { $gt: 0 } }, 
                    { taskCompletedToday: true }
                ] 
            }, 
            { $set: { dailyVideosWatched: 0, taskCompletedToday: false } }
        );

        console.log(`✅ [${timeLabel}] Tasks reset successfully! Total users updated: ${result.modifiedCount}`);
    } catch (err) {
        console.error(`❌ [${timeLabel}] Error in Reset Task:`, err);
    }
};

// 🔴 1. EMERGENCY CRON (Test time apne hisaab se adjust kar lena)
cron.schedule('48 17 * * *', () => {
    // setTimeout se node-cron ka timer block nahi hoga aur error nahi aayega
    setTimeout(() => resetDailyTasks("IST 5:48 PM"), 0);
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});


// 🟢 2. REGULAR CRON: Roz raat 12:05 AM IST ke liye
cron.schedule('5 0 * * *', () => {
    setTimeout(() => resetDailyTasks("IST 12:05 AM"), 0);
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});