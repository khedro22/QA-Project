const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const Notification = require('../models/Notification');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// List all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')           
      .populate('following', 'categoryName')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});


// Get own profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('following', 'categoryName');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});


// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts.' });
    }

    await Content.deleteMany({ userId: req.params.id });

    await Notification.deleteMany({ userId: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});


module.exports = router;