const express = require('express');
const router = express.Router();
const {
    getSubcategories,
    getSubcategoryById,
    getSubcategoryBySlug,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} = require('../controllers/subcategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSubcategories)
    .post(protect, authorize('STAFF_PRODUCT'), createSubcategory);

router.route('/slug/:slug').get(getSubcategoryBySlug);

router.route('/:id')
    .get(getSubcategoryById)
    .put(protect, authorize('STAFF_PRODUCT'), updateSubcategory)
    .delete(protect, authorize('SUPER_ADMIN'), deleteSubcategory);

module.exports = router;
