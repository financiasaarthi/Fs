// const mongoose = require('mongoose');
// require('dotenv').config();

// // Apne models import karo
// const User = require('./models/User');
// const Transaction = require('./models/Transaction');

// const recoverMissingTransactions = async () => {
//     try {
//         console.log("⏳ Connecting to Database...");
//         await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
//         console.log("✅ Database Connected!");
//         console.log("🔍 Scanning for users with missing $10 Package History...");

//         // Un sabhi users ko find karo jinka current package 10 hai
//         const users = await User.find({ 
//             $or: [
//                 { currentPackage: 10 },
//                 { packageAmount: 10 }
//             ] 
//         });

//         let recoveredCount = 0;

//         for (let user of users) {
//             // Check karo ki kya is user ki pehle se PACKAGE_ACTIVATION history hai?
//             const existingTx = await Transaction.findOne({
//                 userId: user.userId,
//                 type: 'PACKAGE_ACTIVATION', // Agar aapka naam alag hai (jaise 'ACTIVATION'), toh change kar lena
//                 amount: 10
//             });

//             // Agar history NAHI mili (Yani ye raat wale missing users hain)
//             if (!existingTx) {
//                 // Nayi history create karo
//                 const newTx = new Transaction({
//                     userId: user.userId,
//                     type: 'PACKAGE_ACTIVATION', 
//                     transactionType: 'credit',
//                     walletType: 'main_wallet',
//                     amount: 10,
//                     txHash: `FREE-RECOVER-${user.userId}-${Date.now()}`,
//                     description: "Free $10 Registration Bonus Package",
//                     status: "completed",
//                     // Sabse zaruri: Transaction ka time user ki joining date par set kar do taaki timeline sahi rahe
//                     createdAt: user.createdAt || new Date() 
//                 });

//                 await newTx.save();
//                 recoveredCount++;
//                 console.log(`✅ Recovered history for User ID: ${user.userId}`);
//             }
//         }

//         console.log(`\n🎉 Done! Successfully recovered missing transactions for ${recoveredCount} users.`);
        
//         mongoose.disconnect();
//         process.exit(0);

//     } catch (error) {
//         console.error("❌ Recovery Script Error:", error);
//         mongoose.disconnect();
//         process.exit(1);
//     }
// };

// recoverMissingTransactions();