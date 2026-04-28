// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// ==========================================
// 🚀 USER API: GET RANDOM VIDEO 
// ==========================================
router.get('/random', async (req, res) => {
    try {
        const videos = await Video.find({ isActive: true });

        // Fallback for empty database
        if (!videos || videos.length === 0) {
            return res.status(200).json({
                _id: "default_video_1",
                title: "Welcome to Financial Saarthi",
                url: "https://www.youtube.com/embed/tgbNymZ7vqY", 
                shareMessage: "Welcome to Financial Saarthi! Watch this video.", // 🆕 Added default message
                duration: 15
            });
        }

        const randomIndex = Math.floor(Math.random() * videos.length);
        res.status(200).json(videos[randomIndex]);

    } catch (error) {
        console.error("Video Fetch Error:", error);
        res.status(500).json({ message: "Server error fetching video." });
    }
});

// ==========================================
// 🚀 ADMIN API: GET ALL VIDEOS (For Table Display)
// ==========================================
router.get('/admin/all', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(videos);
    } catch (error) {
        console.error("Admin Video Fetch Error:", error);
        res.status(500).json({ message: "Error fetching videos for admin." });
    }
});

// ==========================================
// 🚀 ADMIN API: ADD NEW VIDEO
// ==========================================
router.post('/admin/add', async (req, res) => {
    try {
        const { title, url, shareMessage } = req.body; // 🆕 Extract shareMessage from request
        
        if (!title || !url) {
            // Updated to English message
            return res.status(400).json({ message: "Title and URL are both required!" });
        }

        const newVideo = new Video({ 
            title, 
            url, 
            shareMessage: shareMessage || "", // 🆕 Save shareMessage (if provided)
            duration: 15, // Default 15 seconds
            isActive: true 
        });
        
        await newVideo.save();
        res.status(201).json({ message: "Video added successfully!", video: newVideo });
    } catch (error) {
        console.error("Add Video Error:", error);
        res.status(500).json({ message: "Error adding video." });
    }
});

// ==========================================
// 🚀 ADMIN API: DELETE A VIDEO (Extra Feature)
// ==========================================
router.delete('/admin/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Video.findByIdAndDelete(id);
        res.status(200).json({ message: "Video deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting video." });
    }
});

module.exports = router;