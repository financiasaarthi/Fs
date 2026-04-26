const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "admin",
        enum: ["admin", "superadmin", "support"]
    },
    permissions: {
        type: Array,
        default: ["all"] 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// 🔥 YE WALA HISSA SABSE ZAROORI HAI 🔥
// Dhyan se dekho: niche (next) nahi hai aur na hi next() call ho raha hai
AdminSchema.pre("save", async function () {
    // 1. Agar password change nahi hua, toh return ho jao
    if (!this.isModified("password")) return;

    // 2. Password hash karo
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // ✅ Yahan next() bilkul nahi likhna hai
    } catch (error) {
        throw new Error("Hashing failed: " + error.message);
    }
});

AdminSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);