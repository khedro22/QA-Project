const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// get all categories 
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ categoryName: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Create category (admin only for testing)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ message: 'Category name is required.' });
        }

        const category = new Category({ categoryName: categoryName.trim() });
        await category.save();

        res.status(201).json({
            message: 'Category created.',
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
});

// Follow category (any logged-in user)
router.post('/:id/follow', authMiddleware, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const user = await User.findById(req.user._id);

        if (user.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Already following this category.' });
        }

        user.following.push(req.params.id);
        await user.save();

        res.json({ message: 'Category followed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Unfollow category (any logged-in user)
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const user = await User.findById(req.user._id);

        if (!user.following.includes(req.params.id)) {
            return res.status(400).json({ message: 'Not following this category.' });
        }

        user.following = user.following.filter(
            id => id.toString() !== req.params.id
        );
        await user.save();

        res.json({ message: 'Category unfollowed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;