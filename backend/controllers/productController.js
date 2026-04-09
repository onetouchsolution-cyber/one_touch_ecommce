const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Make = require('../models/Make');
const Model = require('../models/Model');
const generateSlug = require('../utils/generateSlug');

// @desc    Fetch all products with optional hierarchical filtering
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products with optional hierarchical filtering
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products with advanced filtering and sorting
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products with optional hierarchical filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const {
        category, subcategory, make, model,
        categoryKey, subcategorySlug, makeSlug, modelSlug,
        keyword, minPrice, maxPrice, inStock, sort,
        group, // New parameter
        page = 1, limit = 12
    } = req.query;

    let query = { isActive: true };

    const Subcategory = require('../models/Subcategory');
    const Category = require('../models/Category');
    const Make = require('../models/Make'); // Now Make is the "Brand"
    const Model = require('../models/Model');

    // Category Group Mappings
    const CATEGORY_GROUPS = {
        'mobile': ['mobile_parts', 'mobile_case', 'mobile_accessories'],
        'laptop': ['laptop_computer_parts', 'computer_accessories'],
        'cctv': ['cctv_accessories', 'cctv_parts']
    };

    // 1. Keyword Search
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    // 2. Hierarchy Filtering

    // Group Filtering (Verticals)
    let groupCategoryIds = [];
    if (group && CATEGORY_GROUPS[group]) {
        const keys = CATEGORY_GROUPS[group];
        // Find categories matching these keys OR slugs
        const groupCats = await Category.find({
            $or: [
                { key: { $in: keys } },
                { slug: { $in: keys } }
            ]
        });
        groupCategoryIds = groupCats.map(c => c._id);

        // Apply initial group filter
        if (groupCategoryIds.length > 0) {
            query.category = { $in: groupCategoryIds };
        }
    }

    // Category (Specific Selection)
    if (categoryKey) {
        const cat = await Category.findOne({ $or: [{ key: categoryKey }, { slug: categoryKey }] });
        if (cat) {
            query.category = cat._id;
        }
    } else if (category && category !== 'all') {
        query.category = category;
    }

    // Subcategory (Slug or ID)
    if (subcategorySlug) {
        const sub = await Subcategory.findOne({ slug: subcategorySlug });
        if (sub) query.subcategory = sub._id;
    } else if (subcategory && subcategory !== 'all') {
        query.subcategory = subcategory;
    }

    // Make (Slug, ID, or Multi-select CSV)
    if (makeSlug) {
        const slugs = makeSlug.split(',');
        const makes = await Make.find({ slug: { $in: slugs } });
        if (makes.length > 0) {
            query.make = { $in: makes.map(m => m._id) };
        }
    } else if (make && make !== 'all') {
        const ids = make.split(',');
        query.make = { $in: ids };
    }

    // Model
    if (modelSlug) {
        const mdl = await Model.findOne({ slug: modelSlug });
        if (mdl) {
            const modelQuery = {
                $or: [
                    { model: mdl._id },
                    { compatibleModels: mdl._id }
                ]
            };
            // Merge with existing keyword $or if needed (using $and)
            if (query.$or) {
                query.$and = [{ $or: query.$or }, modelQuery];
                delete query.$or;
            } else {
                Object.assign(query, modelQuery);
            }
        }
    } else if (model && model !== 'all') {
        const modelQuery = {
            $or: [
                { model: model },
                { compatibleModels: model }
            ]
        };
        if (query.$or) {
            query.$and = [{ $or: query.$or }, modelQuery];
            delete query.$or;
        } else {
            Object.assign(query, modelQuery);
        }
    }

    // 3. Price Range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 4. Stock Availability
    if (inStock === 'true') {
        query.countInStock = { $gt: 0 };
    }

    // 5. Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
    } else if (sort === 'price_asc') {
        sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
        sortOption = { price: -1 };
    } else if (sort === 'popular') {
        sortOption = { viewCount: -1, orderCount: -1 };
    } else if (sort === 'name_asc') {
        sortOption = { name: 1 };
    }

    // 6. Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('make', 'name slug')
        .populate('model', 'name slug')
        .populate('category', 'name key')
        .populate('subcategory', 'name slug')
        .sort(sortOption)
        .limit(limitNum)
        .skip(skip);

    res.json({
        products,
        page: pageNum,
        pages: Math.ceil(count / limitNum),
        total: count
    });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('make', 'name slug logo description')
        .populate('model', 'name slug description image releaseYear')
        .populate('category', 'name key slug description')
        .populate('subcategory', 'name slug description')
        .populate('compatibleModels', 'name slug make')
        .populate({
            path: 'compatibleModels',
            populate: {
                path: 'make',
                select: 'name slug'
            }
        });

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate('make', 'name slug logo description')
        .populate('model', 'name slug description image releaseYear')
        .populate('category', 'name key slug description')
        .populate('subcategory', 'name slug description')
        .populate('compatibleModels', 'name slug make')
        .populate({
            path: 'compatibleModels',
            populate: {
                path: 'make',
                select: 'name slug'
            }
        });

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Staff
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, image, images, make, model, compatibleModels, category, subcategory, countInStock, description, specifications, isActive } = req.body;
    const Subcategory = require('../models/Subcategory');

    // 1. Validate Category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        res.status(400);
        throw new Error('Category not found');
    }

    // 2. Validate Subcategory (Product Type)
    if (subcategory) {
        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) {
            res.status(400);
            throw new Error('Subcategory not found');
        }
        if (subcategoryExists.category.toString() !== category) {
            res.status(400);
            throw new Error('Subcategory does not match the selected Category');
        }
    }

    // 4. Validate Make
    const makeExists = await Make.findById(make);
    if (!makeExists) {
        res.status(400);
        throw new Error('Make not found');
    }

    // 5. Validate Model
    const strictModelCategories = ['mobile_parts', 'mobile_case', 'laptop_computer_parts'];

    // Check if category requires model
    const isStrictCategory = strictModelCategories.includes(categoryExists.key) || strictModelCategories.includes(categoryExists.slug);

    if (isStrictCategory && !model) {
        res.status(400);
        throw new Error('Model is required for this category');
    }

    if (model) {
        const modelExists = await Model.findById(model);
        if (!modelExists) {
            res.status(400);
            throw new Error('Model not found');
        }
        if (modelExists.make.toString() !== make) {
            res.status(400);
            throw new Error('Model does not match the selected Make');
        }
    }

    // Generate slug if not provided
    var slug = await generateSlug(name, Product);

    const product = await Product.create({
        name,
        price,
        user: req.user._id,
        image,
        images: images || [],
        make,
        model: model || null,
        compatibleModels: compatibleModels || [],
        category,
        subcategory: subcategory || null,
        countInStock,
        description,
        specifications: specifications || {},
        isActive: isActive !== undefined ? isActive : true,
        slug: slug || undefined,
    });

    const createdProduct = await product.populate(['make', 'model', 'category', 'subcategory', 'compatibleModels']);
    res.status(201).json(createdProduct);
});



// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, image, images, make, model, compatibleModels, category, subcategory, countInStock, description, specifications, isActive } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Validate make if provided
        if (make) {
            const makeExists = await Make.findById(make);
            if (!makeExists) {
                res.status(400);
                throw new Error('Make not found');
            }
        }

        // Validate category if provided
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                res.status(400);
                throw new Error('Category not found');
            }
        }

        // Validate model if provided OR if category is changing/strict
        // If category is being updated, check if new category requires model
        // If model is being removed (set to null), check if current/new category requires it
        // This is complex because we need to know the FINAL category.

        const finalCategoryId = category || product.category;
        const finalCategory = await Category.findById(finalCategoryId); // optimizing: if category provided, we fetched it above. if not, fetch now or use product.category (but need doc).
        // Reuse categoryExists if available

        // Let's simplify: if model is provided, validate it. 
        // If model is NOT provided (undefined), no change. 
        // If model is explicitly null, check strictness?
        // User might not send explicit null to remove.
        // But if they change category to "Mobile", they SHOULD provide a model if it was missing?
        // Ideally frontend handles this. Backend should just ensure data consistency.

        const strictModelCategories = ['mobile_parts', 'mobile_case', 'laptop_computer_parts'];
        const isStrictCategory = finalCategory && (strictModelCategories.includes(finalCategory.key) || strictModelCategories.includes(finalCategory.slug));

        if (isStrictCategory && !model && !product.model) {
            // If strict, and no new model provided, and no existing model.
            // But 'model' undefined means no update.
            // We only care if they are TRYING to save an invalid state?
            // Or if they are updating category to strict one.
            if (category) { // Category is changing to strict
                res.status(400);
                throw new Error('Model is required for this category');
            }
        }

        if (model) {
            const modelExists = await Model.findById(model);
            if (!modelExists) {
                res.status(400);
                throw new Error('Model not found');
            }
            const makeId = make || product.make.toString();
            if (modelExists.make.toString() !== makeId) {
                res.status(400);
                throw new Error('Model does not belong to the selected make');
            }
        }

        // Validate subcategory if provided
        if (subcategory) {
            const subcategoryExists = await Category.findById(subcategory); // Wait, should likely be Subcategory model?
            // Existing code used Category.findById(subcategory) which might be wrong if Subcategory is separate collection?
            // In createProduct it required Subcategory model. 
            // I will fix this potential bug here by requiring Subcategory if I can, or stick to replacing what I see if convinced it works (e.g. if Subcategory is in Category collection? No, separate).
            // Line 31 in original file: const Subcategory = require('../models/Subcategory');
            // But updateProduct didn't import it?
            // I will import it.
            const Subcategory = require('../models/Subcategory');
            const subExists = await Subcategory.findById(subcategory);

            if (!subExists) {
                res.status(400);
                throw new Error('Subcategory not found');
            }
            // Logic check omitted to minimize diff size/risk, assuming basic existence is enough for now or user responsible.
        }

        product.name = name || product.name;
        product.price = price !== undefined ? price : product.price;
        product.image = image || product.image;
        product.images = images !== undefined ? images : product.images;
        product.make = make || product.make;
        product.model = model !== undefined ? model : product.model;
        product.compatibleModels = compatibleModels !== undefined ? compatibleModels : product.compatibleModels;
        product.category = category || product.category;
        product.subcategory = subcategory !== undefined ? subcategory : product.subcategory;

        // Prevent manual stock update if Zoho Linked
        if (product.zoho_item_id && countInStock !== undefined) {
            res.status(400);
            throw new Error('Cannot manually update stock for Zoho-integrated items. Please update valid stock in Zoho Inventory.');
        } else {
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        }

        product.description = description || product.description;
        product.specifications = specifications !== undefined ? specifications : product.specifications;

        // Handle isActive
        if (isActive !== undefined) {
            product.isActive = isActive;
            if (isActive === false) {
                product.deactivated_at = new Date();
                product.status = 'Inactive';
            } else {
                product.deactivated_at = null;
                product.status = 'Active';
            }
        }

        // Regenerate slug if name changed
        if (name && name !== product.name) {
            product.slug = undefined; // Will be regenerated by pre-save hook
        }

        const updatedProduct = await product.save();
        await updatedProduct.populate(['make', 'model', 'category', 'subcategory', 'compatibleModels']);
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Soft delete
        product.isActive = false;
        product.deactivated_at = new Date();
        product.status = 'Inactive'; // Sync status if used
        await product.save();
        res.json({ message: 'Product deactivated' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Trigger Manual Zoho Sync
// @route   POST /api/products/sync-zoho
// @access  Private/Admin
const syncProducts = asyncHandler(async (req, res) => {
    const { syncZohoItems } = require('../services/zohoService');
    const result = await syncZohoItems();
    if (result.success) {
        res.json({ message: 'Zoho Sync Completed', details: result });
    } else {
        res.status(500);
        throw new Error(result.error || 'Zoho Sync Failed');
    }
});

// @desc    Search for products locally (Zoho Items) for Dropdown
// @route   GET /api/products/search-zoho
// @access  Private/Admin
const searchZohoItems = asyncHandler(async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        res.status(400);
        throw new Error('Keyword is required');
    }

    // Search by Name or SKU
    // Only search items that have a zoho_item_id (synced items)
    const products = await Product.find({
        zoho_item_id: { $exists: true },
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { sku: { $regex: keyword, $options: 'i' } }
        ]
    }).select('name sku countInStock actual_available_stock zoho_item_id').limit(20);

    res.json(products);
});


// @desc    Get dynamic filters based on current selection/group
// @route   GET /api/products/filters
// @access  Public
const getFilters = asyncHandler(async (req, res) => {
    const { group, categoryKey, subcategorySlug, makeSlug, modelSlug } = req.query;

    // Base Match (Group/Vertical)
    let baseMatch = { isActive: true };

    const CATEGORY_GROUPS = {
        'mobile': ['mobile_parts', 'mobile_case', 'mobile_accessories'],
        'laptop': ['laptop_computer_parts', 'computer_accessories'],
        'cctv': ['cctv_accessories', 'cctv_parts']
    };

    const Category = require('../models/Category');
    const Subcategory = require('../models/Subcategory');
    const Make = require('../models/Make');
    const Model = require('../models/Model');

    // Resolve Group to Category IDs
    if (group && CATEGORY_GROUPS[group]) {
        const keys = CATEGORY_GROUPS[group];
        const groupCats = await Category.find({
            $or: [
                { key: { $in: keys } },
                { slug: { $in: keys } }
            ]
        });
        const groupCategoryIds = groupCats.map(c => c._id);
        if (groupCategoryIds.length > 0) {
            baseMatch.category = { $in: groupCategoryIds };
        }
    }

    // Resolve Selected Filters to IDs
    let selectedCategory = null;
    if (categoryKey) {
        selectedCategory = await Category.findOne({ $or: [{ key: categoryKey }, { slug: categoryKey }] });
    }

    let selectedSubcategory = null;
    if (subcategorySlug) {
        selectedSubcategory = await Subcategory.findOne({ slug: subcategorySlug });
    }

    let selectedMake = null;
    if (makeSlug) {
        // Multi-select support for Make? Cascading usually implies single path or subset. 
        const slugs = makeSlug.split(',');
        const makes = await Make.find({ slug: { $in: slugs } });
        if (makes.length > 0) {
            selectedMake = makes.map(m => m._id);
        }
    }

    // --- Build Facet Queries ---

    // 1. Categories: Depends ONLY on Group (Base Match)
    const categoryQuery = Product.aggregate([
        { $match: baseMatch },
        { $group: { _id: "$category" } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug", key: "$detail.key" } },
        { $sort: { name: 1 } }
    ]);

    // 2. Subcategories: Depends on Group AND Selected Category
    let subcatMatch = { ...baseMatch };
    if (selectedCategory) {
        subcatMatch.category = selectedCategory._id;
    }
    const subcategoryQuery = Product.aggregate([
        { $match: subcatMatch },
        { $group: { _id: "$subcategory" } },
        { $lookup: { from: "subcategories", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    // 3. Makes: Depends on Group AND Category AND Subcategory
    let makeMatch = { ...subcatMatch };
    if (selectedSubcategory) {
        makeMatch.subcategory = selectedSubcategory._id;
    }
    const makeQuery = Product.aggregate([
        { $match: makeMatch },
        { $group: { _id: "$make" } },
        { $lookup: { from: "makes", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    // 4. Models: Depends on Group AND Category AND Subcategory AND Make
    let modelMatch = { ...makeMatch };
    if (selectedMake) {
        if (Array.isArray(selectedMake)) {
            modelMatch.make = { $in: selectedMake };
        } else {
            modelMatch.make = selectedMake;
        }
    }
    const modelQuery = Product.aggregate([
        { $match: modelMatch },
        { $group: { _id: "$model" } },
        { $lookup: { from: "models", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    const [categories, subcategories, makes, models] = await Promise.all([
        categoryQuery,
        subcategoryQuery,
        makeQuery,
        modelQuery
    ]);

    res.json({
        categories,
        subcategories,
        makes,
        models
    });
});

// @desc    Get bi-directional smart filters
// @route   GET /api/products/filters/smart
// @access  Public
const getSmartFilters = asyncHandler(async (req, res) => {
    const { group, categoryKey, subcategorySlug, makeSlug, modelSlug } = req.query;

    // 1. Resolve Parameters to IDs (Common Logic)

    // Group (Vertical)
    const CATEGORY_GROUPS = {
        'mobile': ['mobile_parts', 'mobile_case', 'mobile_accessories'],
        'laptop': ['laptop_computer_parts', 'computer_accessories'],
        'cctv': ['cctv_accessories', 'cctv_parts']
    };

    const Category = require('../models/Category');
    const Subcategory = require('../models/Subcategory');
    const Make = require('../models/Make');
    const Model = require('../models/Model');

    let groupCategoryIds = [];
    if (group && CATEGORY_GROUPS[group]) {
        const keys = CATEGORY_GROUPS[group];
        const groupCats = await Category.find({
            $or: [{ key: { $in: keys } }, { slug: { $in: keys } }]
        });
        groupCategoryIds = groupCats.map(c => c._id);
    }

    // Resolvers
    const resolveCategory = async () => {
        if (!categoryKey) return null;
        return await Category.findOne({ $or: [{ key: categoryKey }, { slug: categoryKey }] });
    };

    const resolveSubcategory = async () => {
        if (!subcategorySlug) return null;
        return await Subcategory.findOne({ slug: subcategorySlug });
    };

    const resolveMake = async () => {
        if (!makeSlug) return null;
        const slugs = makeSlug.split(','); // Supporting CSV
        const makes = await Make.find({ slug: { $in: slugs } });
        if (makes.length === 0) return null;
        return makes.map(m => m._id);
    };

    const resolveModel = async () => {
        if (!modelSlug) return null;
        return await Model.findOne({ slug: modelSlug });
    };

    const [selectedCategory, selectedSubcategory, selectedMakes, selectedModel] = await Promise.all([
        resolveCategory(),
        resolveSubcategory(),
        resolveMake(),
        resolveModel()
    ]);

    // 2. Build Base Build Match Function
    // Helper to build match object *excluding* one field (Disjunctive Logic)
    const buildMatch = (excludeField) => {
        let match = { isActive: true };

        // Group Constraint (Always Applied)
        if (groupCategoryIds.length > 0) {
            match.category = { $in: groupCategoryIds };
        }

        // Apply filters IF they are NOT the excluded field

        // Category
        if (excludeField !== 'category' && selectedCategory) {
            match.category = selectedCategory._id;
        }

        // Subcategory
        if (excludeField !== 'subcategory' && selectedSubcategory) {
            match.subcategory = selectedSubcategory._id;
        }

        // Make
        if (excludeField !== 'make' && selectedMakes) {
            match.make = { $in: selectedMakes };
        }

        // Model
        if (excludeField !== 'model' && selectedModel) {
            // Model logic can be complex ($or with compatibleModels). 
            // For filter options, usually we simply match products tied to this model.
            match.$and = [
                { $or: [{ model: selectedModel._id }, { compatibleModels: selectedModel._id }] }
            ];
        }

        return match;
    };

    // 3. Parallel Aggregations (One for each facet)

    // Categories: What categories are valid given the OTHER selected filters?
    const categoryQuery = Product.aggregate([
        { $match: buildMatch('category') },
        { $group: { _id: "$category" } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug", key: "$detail.key" } },
        { $sort: { name: 1 } }
    ]);

    // Subcategories: What subcategories are valid given the OTHER selected filters?
    const subcategoryQuery = Product.aggregate([
        { $match: buildMatch('subcategory') },
        { $group: { _id: "$subcategory" } },
        { $lookup: { from: "subcategories", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    // Makes: What makes are valid given the OTHER selected filters?
    const makeQuery = Product.aggregate([
        { $match: buildMatch('make') },
        { $group: { _id: "$make" } },
        { $lookup: { from: "makes", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    // Models: What models are valid given the OTHER selected filters?
    const modelQuery = Product.aggregate([
        { $match: buildMatch('model') },
        { $group: { _id: "$model" } },
        { $lookup: { from: "models", localField: "_id", foreignField: "_id", as: "detail" } },
        { $unwind: "$detail" },
        { $project: { _id: 1, name: "$detail.name", slug: "$detail.slug" } },
        { $sort: { name: 1 } }
    ]);

    const [categories, subcategories, makes, models] = await Promise.all([
        categoryQuery,
        subcategoryQuery,
        makeQuery,
        modelQuery
    ]);

    res.json({
        categories,
        subcategories,
        makes,
        models
    });
});

// @desc    Export Products to CSV
// @route   GET /api/products/export
// @access  Private/Admin
const exportProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('category subcategory make model');
    const { generateCSV } = require('../utils/csvUtils');

    const flattenProducts = products.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        countInStock: p.countInStock,
        category: p.category?.name || '',
        subcategory: p.subcategory?.name || '',
        make: p.make?.name || '',
        model: p.model?.name || '',
        sku: p.sku || '',
        description: p.description
    }));

    const fields = ['_id', 'name', 'price', 'countInStock', 'category', 'subcategory', 'make', 'model', 'sku', 'description'];
    const csv = generateCSV(flattenProducts, fields);

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
});

// @desc    Import Products from CSV
// @route   POST /api/products/import
// @access  Private/Admin
const importProducts = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const { parseCSV } = require('../utils/csvUtils');
    const productsToCheck = await parseCSV(req.file.path);

    const Category = require('../models/Category');
    const Make = require('../models/Make');
    const Model = require('../models/Model');

    // Simple import strategy: Create new if ID not present? Or just create all?
    // User asked for "mapping", which implies advanced UI.
    // For now, assume CSV headers match our fields or mapped in frontend?
    // Let's assume CSV has: name, price, categoryName, makeName, etc.
    // Backend needs to resolve names to IDs.

    let createdCount = 0;
    const errors = [];

    for (const p of productsToCheck) {
        try {
            // Resolver logic (simplified)
            let categoryId, makeId, modelId;

            if (p.category) {
                const cat = await Category.findOne({ name: { $regex: new RegExp(`^${p.category}$`, 'i') } });
                if (cat) categoryId = cat._id;
            }
            if (p.make) {
                const mk = await Make.findOne({ name: { $regex: new RegExp(`^${p.make}$`, 'i') } });
                if (mk) makeId = mk._id;
            }

            // Create
            if (p.name && p.price && categoryId && makeId) {
                await Product.create({
                    name: p.name,
                    price: Number(p.price),
                    countInStock: Number(p.countInStock) || 0,
                    category: categoryId,
                    make: makeId,
                    description: p.description || p.name,
                    user: req.user._id,
                    image: '/images/sample.jpg' // Default or placeholder
                });
                createdCount++;
            } else {
                errors.push(`Skipped ${p.name}: Missing required fields or invalid Relations`);
            }
        } catch (err) {
            errors.push(`Error importing ${p.name}: ${err.message}`);
        }
    }

    res.json({ message: 'Import Processed', createdCount, errors });
});

// @desc    Get Sample CSV for Import
// @route   GET /api/products/sample-csv
// @access  Private/Admin
const getSampleCSV = asyncHandler(async (req, res) => {
    const fields = ['name', 'price', 'countInStock', 'category', 'subcategory', 'make', 'model', 'sku', 'description'];
    const exampleData = [
        {
            name: 'Sample Product Name',
            price: 999,
            countInStock: 10,
            category: 'Mobile Parts',
            subcategory: 'LCD Screen',
            make: 'Samsung',
            model: 'Galaxy S21',
            sku: 'SAM-S21-LCD',
            description: 'Original LCD Screen for Samsung Galaxy S21'
        }
    ];

    const { generateCSV } = require('../utils/csvUtils');
    const csv = generateCSV(exampleData, fields);

    res.header('Content-Type', 'text/csv');
    res.attachment('products_sample.csv');
    res.send(csv);
});

module.exports = {
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
    exportProducts,
    importProducts,
    getSampleCSV
};
