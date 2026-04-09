const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    syncProducts,
    searchZohoItems,
    getFilters,
    getSmartFilters,
    getSampleCSV
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/sync-zoho').post(protect, authorize('SUPER_ADMIN'), syncProducts);
router.route('/search-zoho').get(protect, authorize('STAFF_PRODUCT', 'SUPER_ADMIN'), searchZohoItems);
router.route('/filters/smart').get(getSmartFilters);
router.route('/filters').get(getFilters);
router.route('/sample-csv').get(protect, authorize('STAFF_PRODUCT'), getSampleCSV);
router.route('/')
    .get(getProducts)
    .post(protect, authorize('STAFF_PRODUCT'), createProduct);
router.route('/slug/:slug').get(getProductBySlug);
router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('STAFF_PRODUCT'), updateProduct)
    .delete(protect, authorize('SUPER_ADMIN'), deleteProduct);

module.exports = router;
