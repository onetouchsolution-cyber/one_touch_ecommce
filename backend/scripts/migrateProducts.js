const connectDB = require('../config/db');
const Make = require('../models/Make');
const Model = require('../models/Model');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sample makes and models data
const makesData = [
    {
        name: 'Apple',
        description: 'American multinational technology company',
        logo: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=200',
        categories: []
    },
    {
        name: 'Samsung',
        description: 'South Korean multinational conglomerate',
        logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200',
        categories: []
    },
    {
        name: 'Dell',
        description: 'American multinational computer technology company',
        logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
        categories: []
    },
    {
        name: 'One Touch',
        description: 'One Touch Solution - Quality parts and accessories',
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
        categories: []
    }
];

const modelsData = {
    'Apple': [
        { name: 'iPhone 13 Pro', releaseYear: 2021, description: 'Pro model with advanced camera system' },
        { name: 'iPhone 13', releaseYear: 2021, description: 'Standard iPhone 13 model' },
        { name: 'iPhone 12', releaseYear: 2020, description: 'iPhone 12 series' },
        { name: 'MacBook Air M1', releaseYear: 2020, description: 'MacBook Air with M1 chip' },
        { name: 'MacBook Pro M1', releaseYear: 2020, description: 'MacBook Pro with M1 chip' },
        { name: 'iPad Pro 11-inch', releaseYear: 2021, description: '11-inch iPad Pro' },
    ],
    'Samsung': [
        { name: 'Galaxy S21 Ultra', releaseYear: 2021, description: 'Flagship Galaxy S21 Ultra' },
        { name: 'Galaxy S21', releaseYear: 2021, description: 'Standard Galaxy S21' },
        { name: 'Galaxy Note 20', releaseYear: 2020, description: 'Galaxy Note 20 series' },
    ],
    'Dell': [
        { name: 'XPS 13', releaseYear: 2021, description: 'Dell XPS 13 ultrabook' },
        { name: 'XPS 15', releaseYear: 2021, description: 'Dell XPS 15 laptop' },
        { name: 'Inspiron 15', releaseYear: 2021, description: 'Dell Inspiron 15' },
    ]
};

const migrateData = async () => {
    try {
        await connectDB();

        console.log('Starting data migration...');

        // Step 1: Create Makes
        console.log('Creating makes...');
        const createdMakes = {};

        for (const makeData of makesData) {
            const make = await Make.create(makeData);
            createdMakes[make.name] = make;
            console.log(`Created make: ${make.name}`);
        }

        // Step 2: Create Models
        console.log('\nCreating models...');
        const createdModels = {};

        for (const [makeName, models] of Object.entries(modelsData)) {
            const make = createdMakes[makeName];
            if (!make) continue;

            createdModels[makeName] = [];

            for (const modelData of models) {
                const model = await Model.create({
                    ...modelData,
                    make: make._id
                });
                createdModels[makeName].push(model);
                console.log(`Created model: ${model.name} for ${makeName}`);
            }
        }

        // Step 3: Get categories
        console.log('\nFetching categories...');
        const categories = await Category.find({});
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat;
        });

        // Step 4: Update existing products (if any exist with old schema)
        console.log('\nChecking for existing products to migrate...');
        const oldProducts = await Product.find({}).lean();

        if (oldProducts.length > 0) {
            console.log(`Found ${oldProducts.length} products. Note: These may need manual migration due to schema changes.`);
            console.log('Please run the seeder to create new sample products with the correct schema.');
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\nCreated Makes:', Object.keys(createdMakes).length);
        console.log('Created Models:', Object.values(createdModels).flat().length);
        console.log('\nNext steps:');
        console.log('1. Run: npm run data:destroy (to clear old products)');
        console.log('2. Run: npm run data:import (to import new sample products)');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateData();
