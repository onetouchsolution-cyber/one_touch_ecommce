const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).populate('subcategories');
    res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate('subcategories');

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Get subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
    const Subcategory = require('../models/Subcategory');
    const subcategories = await Subcategory.find({ category: req.params.id });
    res.json(subcategories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, image, parent, isActive } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    // If parent is provided, verify it exists
    if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
            res.status(400);
            throw new Error('Parent category not found');
        }
    }

    const category = await Category.create({
        name,
        slug: req.body.slug, // Optional manual slug
        description,
        image,
        parent: parent || null,
        isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, image, isActive, parent } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
        // Prevent renaming system categories
        if (category.is_system && name && name !== category.name) {
            res.status(400);
            throw new Error('System categories cannot be renamed');
        }

        // Check if new name conflicts with existing category (excluding current)
        if (name && name !== category.name) {
            const nameExists = await Category.findOne({ name });
            if (nameExists) {
                res.status(400);
                throw new Error('Category name already exists');
            }
        }

        // Prevent setting parent to self or creating circular reference
        if (parent && parent === req.params.id) {
            res.status(400);
            throw new Error('Category cannot be its own parent');
        }

        if (name && name !== category.name) {
            category.slug = undefined; // Trigger regeneration
        }

        category.name = name || category.name;
        category.slug = req.body.slug || category.slug;
        category.description = description !== undefined ? description : category.description;
        category.image = image !== undefined ? image : category.image;
        category.isActive = isActive !== undefined ? isActive : category.isActive;
        category.parent = parent !== undefined ? parent : category.parent;

        if (isActive === false) {
            category.deactivated_at = new Date();
        } else if (isActive === true) {
            category.deactivated_at = null;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category (Soft Delete)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        // Prevent deleting system categories
        if (category.is_system) {
            res.status(400);
            throw new Error('System categories cannot be deleted');
        }

        // Check if category has subcategories
        const Subcategory = require('../models/Subcategory');
        const subcategories = await Subcategory.find({ category: req.params.id });
        if (subcategories.length > 0) {
            res.status(400);
            throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
        }

        // Check if category has products
        const products = await Product.find({ category: req.params.id });
        if (products.length > 0) {
            res.status(400);
            throw new Error('Cannot delete category with associated products. Remove or reassign products first.');
        }

        // Soft delete instead of hard delete
        category.isActive = false;
        category.deactivated_at = new Date();
        await category.save();

        res.json({ message: 'Category deactivated' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Get category by slugOrKey
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
    // Try to find by slug first, then key
    const category = await Category.findOne({
        $or: [
            { slug: req.params.slug },
            { key: req.params.slug }
        ]
    }).populate('subcategories');

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

module.exports = {
    getCategories,
    getCategoryById,
    getCategoryBySlug, // Added
    getSubcategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
