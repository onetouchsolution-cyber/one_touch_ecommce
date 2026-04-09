const mongoose = require('mongoose');

const subcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    categoryKey: {
        type: String,
        required: true, // Stores the fixed category key (e.g., 'mobile_parts')
    },
    logo: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Pre-save hook to generate slug
// subcategorySchema.pre('save', function (next) {
//     if (!this.slug && this.name) {
//         this.slug = this.name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, '-')
//             .replace(/^-+|-+$/g, '');
//     }
//     next();
// });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
