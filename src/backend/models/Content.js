const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  contentName: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['video', 'voice', 'article'], 
    required: true 
  },
  description: { 
    type: String,
    default: null 
  },
  url: { 
    type: String,
    default: null 
  },
  voiceFile: {
    type: String,
    default: null 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  }
}, { timestamps: true });

contentSchema.pre('save', function(next) {
  if (this.type === 'video' && !this.url) {
    return next(new Error('Video type requires a URL'));
  }
  if (this.type === 'voice' && !this.voiceFile) {
    return next(new Error('Voice type requires a voice file'));
  }
  if (this.type === 'article' && !this.description) {
    return next(new Error('Article type requires article text'));
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema);