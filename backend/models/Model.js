const mongoose = require('mongoose');

const modelSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    make: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Make',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    releaseYear: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Compound unique index on make + slug
modelSchema.index({ make: 1, slug: 1 }, { unique: true });

// modelSchema.pre('save', function (next) {
//     if (!this.slug && this.name) {
//         this.slug = this.name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, '-')
//             .replace(/^-+|-+$/g, '');
//     }
//     next();
// });

const Model = mongoose.model('Model', modelSchema);

module.exports = Model;
