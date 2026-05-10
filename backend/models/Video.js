// backend/models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }, // YouTube link
    shareMessage: { type: String, default: "" }, // 🆕 New field for Custom Share Message
    duration: { type: Number, default: 30 }, // Kitne second dekhna hai
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);