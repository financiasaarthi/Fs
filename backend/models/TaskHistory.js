const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  packageName: { type: String, required: true },
  reward: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TaskHistory', taskHistorySchema);