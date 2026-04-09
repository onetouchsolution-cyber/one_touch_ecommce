const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: [String],
    // Hierarchy
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
    },

    make: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Make',
        required: true,
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        required: false, // Changed to false for conditional validation
    },
    compatibleModels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
    }],
    description: {
        type: String,
        required: true,
    },
    specifications: {
        type: Map,
        of: String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    zoho_item_id: {
        type: String,
        unique: true,
        sparse: true,
    },
    sku: {
        type: String,
    },
    group_id: {
        type: String,
    },
    group_name: {
        type: String,
    },
    actual_available_stock: {
        type: Number,
        default: 0,
    },
    reorder_level: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
    },
    last_zoho_modified_time: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    deactivated_at: {
        type: Date,
    },
    last_synced_at: {
        type: Date,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    orderCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

