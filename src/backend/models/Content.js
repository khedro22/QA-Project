const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentName: { type: String, required: true },
  type: { type: String, enum: ['video', 'image', 'article'], required: true },
  description: String,
  url: { type: String, required: true },        // File path or link
  record: String,                                 // Additional metadata
  // 1:M relationships as references
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);