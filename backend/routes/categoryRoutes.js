const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    getSubcategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCategories)
    .post(protect, admin, createCategory);

router.route('/:id')
    .get(getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

router.route('/:id/subcategories')
    .get(getSubcategories);

router.route('/slug/:slug').get(getCategoryBySlug);

module.exports = router;
