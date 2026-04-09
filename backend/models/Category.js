const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    is_system: {
        type: Boolean,
        default: false,
    },
    key: {
        type: String,
        unique: true,
        sparse: true,
    },
    sort_order: {
        type: Number,
        default: 0,
    },
    deactivated_at: {
        type: Date,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'category'
});

// Pre-save hook to generate slug
categorySchema.pre('save', function (next) {
    if ((this.isModified('name') || this.isNew) && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    // next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
