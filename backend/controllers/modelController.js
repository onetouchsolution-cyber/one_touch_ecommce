const asyncHandler = require('express-async-handler');
const Model = require('../models/Model');
const Product = require('../models/Product');
const generateSlug = require('../utils/generateSlug');

// @desc    Fetch all models
// @route   GET /api/models
// @access  Public
// @desc    Fetch all models
// @route   GET /api/models
// @access  Public
const getModels = asyncHandler(async (req, res) => {
    const { make, category } = req.query;
    let query = { isActive: true };

    if (make) {
        const Make = require('../models/Make');
        // Check if ID
        if (make.match(/^[0-9a-fA-F]{24}$/)) {
            query.make = make;
        } else {
            const makeObj = await Make.findOne({ slug: make });
            if (makeObj) {
                query.make = makeObj._id;
            } else {
                return res.json([]);
            }
        }
    }

    // Support legacy category filter if needed, though strictly we go via Make
    if (category) {
        query.category = category;
    }

    const models = await Model.find(query)
        .populate({
            path: 'make',
            select: 'name slug logo'
        })
        .populate('category', 'name slug');
    res.json(models);
});

// @desc    Get model by slug and make
// @route   GET /api/models/:makeSlug/:modelSlug
// @access  Public
const getModelBySlug = asyncHandler(async (req, res) => {
    const { makeSlug, modelSlug } = req.params;

    // First find the make
    const Make = require('../models/Make');
    const make = await Make.findOne({ slug: makeSlug });

    if (!make) {
        res.status(404);
        throw new Error('Make not found');
    }

    const model = await Model.findOne({
        slug: modelSlug,
        make: make._id,
        isActive: true
    })
        .populate('make', 'name slug logo')
        .populate('category', 'name slug');

    if (model) {
        res.json(model);
    } else {
        res.status(404);
        throw new Error('Model not found');
    }
});

// @desc    Get models by make
// @route   GET /api/models/make/:makeId
// @access  Public
const getModelsByMake = asyncHandler(async (req, res) => {
    const models = await Model.find({
        make: req.params.makeId,
        isActive: true
    })
        .populate('make', 'name slug logo')
        .populate('category', 'name slug');

    res.json(models);
});

// @desc    Get models by make slug
// @route   GET /api/models/make-slug/:makeSlug
// @access  Public
const getModelsByMakeSlug = asyncHandler(async (req, res) => {
    const Make = require('../models/Make');
    const make = await Make.findOne({ slug: req.params.makeSlug });

    if (!make) {
        res.status(404);
        throw new Error('Make not found');
    }

    const models = await Model.find({
        make: make._id,
        isActive: true
    })
        .populate('make', 'name slug logo')
        .populate('category', 'name slug');

    res.json(models);
});

// @desc    Get models by category and make
// @route   GET /api/models/category/:categoryId/make/:makeId
// @access  Public
const getModelsByCategoryAndMake = asyncHandler(async (req, res) => {
    const { categoryId, makeId } = req.params;

    const models = await Model.find({
        category: categoryId,
        make: makeId,
        isActive: true
    })
        .populate('make', 'name slug logo')
        .populate('category', 'name slug');

    res.json(models);
});

// @desc    Get models by category slug and make slug
// @route   GET /api/models/category-slug/:categorySlug/make-slug/:makeSlug
// @access  Public
const getModelsByCategoryAndMakeSlug = asyncHandler(async (req, res) => {
    const { categorySlug, makeSlug } = req.params;

    const Make = require('../models/Make');
    const Category = require('../models/Category');

    const [make, category] = await Promise.all([
        Make.findOne({ slug: makeSlug }),
        Category.findOne({ slug: categorySlug })
    ]);

    if (!make || !category) {
        res.status(404);
        throw new Error('Make or Category not found');
    }

    const models = await Model.find({
        category: category._id,
        make: make._id,
        isActive: true
    })
        .populate('make', 'name slug logo')
        .populate('category', 'name slug');

    res.json(models);
});

// @desc    Create a model
// @route   POST /api/models
// @access  Private/Admin
const createModel = asyncHandler(async (req, res) => {
    const { name, make, category, description, image, releaseYear } = req.body;

    // Check if model with same name exists for this make
    const modelExists = await Model.findOne({ name, make });

    if (modelExists) {
        res.status(400);
        throw new Error('Model already exists for this make');
    }

    // Generate slug if not provided
    var slug = await generateSlug(name, Model);

    const model = await Model.create({
        name,
        make,
        category: category || null,
        description,
        image,
        releaseYear,
        isActive: true,
        slug: slug || undefined, // Will be generated by pre-save hook if not provided
    });

    const populatedModel = await model.populate(['make', 'category']);
    res.status(201).json(populatedModel);
});

// @desc    Update a model
// @route   PUT /api/models/:id
// @access  Private/Admin
const updateModel = asyncHandler(async (req, res) => {
    const { name, make, category, description, image, releaseYear, isActive } = req.body;

    const model = await Model.findById(req.params.id);

    if (model) {
        // Check if new name+make conflicts with existing model (excluding current)
        if ((name && name !== model.name) || (make && make !== model.make.toString())) {
            const nameExists = await Model.findOne({
                name: name || model.name,
                make: make || model.make
            });
            if (nameExists && nameExists._id.toString() !== req.params.id) {
                res.status(400);
                throw new Error('Model name already exists for this make');
            }
        }

        model.name = name || model.name;
        model.make = make || model.make;
        model.category = category !== undefined ? category : model.category;
        model.description = description !== undefined ? description : model.description;
        model.image = image !== undefined ? image : model.image;
        model.releaseYear = releaseYear !== undefined ? releaseYear : model.releaseYear;
        model.isActive = isActive !== undefined ? isActive : model.isActive;

        // Regenerate slug if name changed
        if (name && name !== model.name) {
            model.slug = undefined; // Will be regenerated by pre-save hook
        }

        const updatedModel = await model.save();
        await updatedModel.populate(['make', 'category']);
        res.json(updatedModel);
    } else {
        res.status(404);
        throw new Error('Model not found');
    }
});

// @desc    Delete a model (Soft Delete)
// @route   DELETE /api/models/:id
// @access  Private/Admin
const deleteModel = asyncHandler(async (req, res) => {
    const model = await Model.findById(req.params.id);

    if (model) {
        // Check if model has products
        const products = await Product.find({
            $or: [
                { model: req.params.id },
                { compatibleModels: req.params.id }
            ]
        });

        if (products.length > 0) {
            res.status(400);
            throw new Error('Cannot delete model with associated products. Remove or reassign products first.');
        }

        model.isActive = false;
        // model.deactivated_at = new Date(); // If model schema has this? 
        // I will assume it does or just set isActive. Model schema had isActive.
        // Let's add deactivated_at if possible, but isActive is minimum.
        await model.save();

        res.json({ message: 'Model deactivated' });
    } else {
        res.status(404);
        throw new Error('Model not found');
    }
});

module.exports = {
    getModels,
    getModelBySlug,
    getModelsByMake,
    getModelsByMakeSlug,
    getModelsByCategoryAndMake,
    getModelsByCategoryAndMakeSlug,
    createModel,
    updateModel,
    deleteModel,
};
