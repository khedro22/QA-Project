const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const Category = require('../models/Category');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { voiceUpload } = require('../middleware/upload');

// List content by category 
router.get('/category/:categoryId', async (req, res) => {
  try {
    const content = await Content.find({ categoryId: req.params.categoryId })
      .populate('userId', 'userName')
      .populate('categoryId', 'categoryName')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get single content 
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('userId', 'userName')
      .populate('categoryId', 'categoryName');

    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

//  Create content 
router.post('/', authMiddleware, (req, res, next) => {
  const contentType = req.body.type;
  
  if (contentType === 'voice') {
    voiceUpload.single('voiceFile')(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { contentName, type, description, categoryId, url} = req.body;

    if (!contentName || !type || !categoryId) {
      cleanupFile(req);
      return res.status(400).json({ message: 'Content name, type, and category are required.' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      cleanupFile(req);
      return res.status(404).json({ message: 'Category not found.' });
    }

    let contentData = {
      contentName: contentName.trim(),
      type,
      description: description || '',
      userId: req.user._id,
      categoryId
    };

    if (type === 'video') {
      if (!url || url.trim() === '') {
        return res.status(400).json({ message: 'Video URL is required.' });
      }
      contentData.url = url.trim();
      
    } else if (type === 'voice') {
      if (!req.file) {
        return res.status(400).json({ message: 'Voice recording file is required.' });
      }
      contentData.voiceFile = `/uploads/${req.file.filename}`;
      
    } else if (type === 'article') {
      if (!description || description.trim() === '') {
        return res.status(400).json({ message: 'Article text is required.' });
      }
      contentData.description = description.trim();
      
    } else {
      return res.status(400).json({ message: 'Invalid content type.' });
    }

    const content = new Content(contentData);
    await content.save();

    await content.populate('userId', 'userName');
    await content.populate('categoryId', 'categoryName');

    
    const followers = await User.find({ following: categoryId });
    
    if (followers.length > 0) {
      const notifications = followers
        .filter(follower => follower._id.toString() !== req.user._id.toString())
        .map(follower => ({
          userId: follower._id,
          categoryId,
          contentId: content._id,
          message: `New ${type}: ${contentName}`,
          read: false
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      message: 'Content published.',
      content
    });

  } catch (error) {
    cleanupFile(req);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete content (owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    if (content.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this content.' });
    }

    if (content.voiceFile) {
      await deleteFile(content.voiceFile);
    }

    await Notification.deleteMany({ contentId: req.params.id });
    await Content.findByIdAndDelete(req.params.id);

    res.json({ message: 'Content deleted.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

function cleanupFile(req) {
  if (req.file) {
    const fs = require('fs').promises;
    fs.unlink(req.file.path).catch(() => {});
  }
}

async function deleteFile(filePath) {
  if (!filePath) return;
  const fs = require('fs').promises;
  const cleanPath = filePath.replace('/uploads/', 'uploads/');
  await fs.unlink(cleanPath).catch(() => {});
}

module.exports = router;