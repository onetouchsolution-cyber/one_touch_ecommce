const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Model = require('../models/Model');

// @desc    Global Search (Products & Models)
// @route   GET /api/search?q=keyword
// @access  Public
const searchGlobal = asyncHandler(async (req, res) => {
    try {
        const keyword = req.query.q;

        if (!keyword) {
            return res.json({ models: [], products: [] });
        }

        // Search Models
        // Model schema has 'make' and 'category', but NOT 'brand'. 
        // Populate only what exists.
        const models = await Model.find({
            name: { $regex: keyword, $options: 'i' }
        })
            .populate('make', 'name slug')
            .select('name slug image make') // Removed brand
            .limit(5);

        // Search Products
        // Product schema has 'brand', 'make', 'model', 'category'.
        const products = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
            .select('name slug price image category brand make model')
            .populate('brand', 'name slug')
            .populate('make', 'name slug')
            .populate('model', 'name slug')
            .limit(5);

        res.json({ models, products });
    } catch (error) {
        console.error('Search API Error:', error);
        // Return empty results instead of crashing
        res.status(500).json({
            models: [],
            products: [],
            message: 'Search failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    searchGlobal
};
