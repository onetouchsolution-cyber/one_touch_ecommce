const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, authorize('STAFF_ORDER', 'STAFF_DELIVERY', 'SUPER_ADMIN'), getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').patch(protect, authorize('STAFF_ORDER', 'STAFF_DELIVERY', 'SUPER_ADMIN'), updateOrderStatus);

module.exports = router;
