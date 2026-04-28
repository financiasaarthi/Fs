require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); 

const MONGO_URI = process.env.MONGO_URI;

const rebuildTreeChronologically = async () => {
    try {
        console.log("🚀 Server Connecting...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected! CLEAN SLATE REBUILD STARTED...");

        // 1. Root ko chhod kar saare users ko strictly "Join Time" ke hisaab se uthao
        const allUsers = await User.find({ userId: { $ne: 1000000 } }).sort({ createdAt: 1 });
        console.log(`📊 Total Users to Rebuild: ${allUsers.length}`);

        // 2. 🟢 VIRTUAL TREE (In-Memory Tracker)
        // Hum purane database placement ko ignore karke ek fresh tree banayenge
        const virtualTree = {
            1000000: { LEFT: null, RIGHT: null } // Root pehle se taiyar hai
        };

        const bulkOperations = [];

        // 3. Ek-ek user ko time ke hisaab se process karo
        for (const user of allUsers) {
            let startSponsor = user.sponsorId;
            let targetSide = (user.position || 'LEFT').toUpperCase();

            // Agar Sponsor galti se virtual tree mein nahi hai, toh Root ke niche daalo
            if (!virtualTree[startSponsor]) {
                startSponsor = 1000000;
            }

            // 🟢 ASLI JADU: Aakhri khali kursi dhundo VIRTUAL TREE mein
            let currentSpot = startSponsor;
            
            while (virtualTree[currentSpot] && virtualTree[currentSpot][targetSide] !== null) {
                // Jab tak jagah bhari hai, niche jate raho
                currentSpot = virtualTree[currentSpot][targetSide];
            }

            const finalPlacementId = currentSpot;

            // 4. Virtual Tree ko update karo naye user ke sath
            virtualTree[finalPlacementId][targetSide] = user.userId; // Parent ka link
            virtualTree[user.userId] = { LEFT: null, RIGHT: null };  // User ki khud ki do khali kursiyan

            // 5. Database update ke liye command taiyar karo
            bulkOperations.push({
                updateOne: {
                    filter: { _id: user._id },
                    update: { $set: { placementId: finalPlacementId, position: targetSide } }
                }
            });

            console.log(`✅ [${user.createdAt.toISOString().split('T')[1].slice(0,8)}] ID ${user.userId} -> Placed Under ${finalPlacementId} (${targetSide})`);
        }

        // 6. Ek hi baar mein poora naya tree Database mein dal do (Super Fast & Safe)
        if (bulkOperations.length > 0) {
            console.log("💾 Saving Perfect Tree to Database...");
            await User.bulkWrite(bulkOperations);
        }

        console.log(`\n✨ MUBARAK HO! Tree Ekdum Perfect Time Ke Hisaab Se Set Ho Gaya Hai.`);
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Fatal Error:", error);
        process.exit(1);
    }
};

rebuildTreeChronologically();