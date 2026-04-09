const asyncHandler = require('express-async-handler');
const Subcategory = require('../models/Subcategory');
const Make = require('../models/Make');
const generateSlug = require('../utils/generateSlug');

// @desc    Fetch all subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
    const { category } = req.query;
    let query = { isActive: true };

    // Allow filtering by category slug or ID if we populated it, but key is easier
    if (category) {
        query.categoryKey = category;
    }

    const subcategories = await Subcategory.find(query).populate('category', 'name key');
    res.json(subcategories);
});

// @desc    Get subcategory by ID
// @route   GET /api/subcategories/:id
// @access  Public
const getSubcategoryById = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findById(req.params.id).populate('category');

    if (subcategory) {
        res.json(subcategory);
    } else {
        res.status(404);
        throw new Error('Subcategory not found');
    }
});

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Staff
const createSubcategory = asyncHandler(async (req, res) => {
    const { name, category, categoryKey, logo } = req.body;

    const subExists = await Subcategory.findOne({ name });
    if (subExists) {
        res.status(400);
        throw new Error('Subcategory already exists');
    }

    const Category = require('../models/Category');
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
        res.status(400);
        throw new Error('Parent category not found');
    }

    const slug = await generateSlug(name, Subcategory);

    const subcategory = await Subcategory.create({
        name,
        slug,
        category,
        categoryKey: categoryKey || parentCategory.key || parentCategory.slug, // Fallback to key or slug
        logo
    });

    res.status(201).json(subcategory);
});

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Staff
const updateSubcategory = asyncHandler(async (req, res) => {
    const { name, logo, isActive, category, categoryKey } = req.body;

    const subcategory = await Subcategory.findById(req.params.id);

    if (subcategory) {
        subcategory.name = name || subcategory.name;
        subcategory.logo = logo !== undefined ? logo : subcategory.logo;
        subcategory.isActive = isActive !== undefined ? isActive : subcategory.isActive;
        subcategory.category = category || subcategory.category;
        subcategory.categoryKey = categoryKey || subcategory.categoryKey;

        // Note: slug auto-update logic might be needed if name changes, usually pre-save handles it if we clear slug
        if (name && name !== subcategory.name) {
            subcategory.slug = await generateSlug(name, Subcategory);
        }

        const updatedSubcategory = await subcategory.save();
        res.json(updatedSubcategory);
    } else {
        res.status(404);
        throw new Error('Subcategory not found');
    }
});

// @desc    Delete a subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findById(req.params.id);

    if (subcategory) {
        // Check for makes
        const makes = await Make.find({ subcategory: req.params.id });
        if (makes.length > 0) {
            res.status(400);
            throw new Error('Cannot delete subcategory with associated makes/brands.');
        }

        await subcategory.deleteOne();
        res.json({ message: 'Subcategory removed' });
    } else {
        res.status(404);
        throw new Error('Subcategory not found');
    }
});

// @desc    Get subcategory by slug
// @route   GET /api/subcategories/slug/:slug
// @access  Public
const getSubcategoryBySlug = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findOne({ slug: req.params.slug })
        .populate('category', 'name key slug');

    if (subcategory) {
        res.json(subcategory);
    } else {
        res.status(404);
        throw new Error('Subcategory not found');
    }
});

module.exports = {
    getSubcategories,
    getSubcategoryById,
    getSubcategoryBySlug, // Added
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
