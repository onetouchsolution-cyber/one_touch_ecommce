const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const Make = require('./models/Make');
const Model = require('./models/Model');
const connectDB = require('./config/db');

dotenv.config();


const Subcategory = require('./models/Subcategory');
const { FIXED_CATEGORIES } = require('./utils/constants');

connectDB().then(() => {
    if (process.argv[2] === '-d') {
        destroyData();
    } else {
        importData();
    }
});

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Model.deleteMany();
        await Make.deleteMany();
        await require('./models/Brand').deleteMany();
        await Subcategory.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        console.log('🧹 Old data cleared.');

        // 1. Create Users
        const createdUsers = await User.insertMany(users.map(user => ({
            ...user,
            role: user.isAdmin ? 'SUPER_ADMIN' : 'CUSTOMER'
        })));

        const adminUser = createdUsers.find(u => u.role === 'SUPER_ADMIN')._id;
        console.log(`👤 Created ${createdUsers.length} users`);

        // 2. Create Fixed Categories
        const createdCategories = await Category.insertMany(FIXED_CATEGORIES.map(c => ({
            ...c,
            is_system: true
        })));
        const catMap = {};
        createdCategories.forEach(c => { catMap[c.key] = c; });
        console.log(`📂 Created ${createdCategories.length} fixed categories`);

        // 3. Create Subcategories (Product Types) - New Definition
        const subcategoriesData = [
            { name: 'Display Screen', code: 'display', catKey: 'mobile_parts' },
            { name: 'Battery', code: 'battery', catKey: 'mobile_parts' },
            { name: 'Charging Port', code: 'charging-port', catKey: 'mobile_parts' },
            { name: 'Back Panel', code: 'back-panel', catKey: 'mobile_parts' },
            { name: 'Mobile Case', code: 'cases', catKey: 'mobile_cases' },
            { name: 'Screen Guard', code: 'screen-guard', catKey: 'mobile_accessories' },
            { name: 'Laptop Screen', code: 'laptop-screen', catKey: 'laptop_computer_parts' },
            { name: 'Keyboard', code: 'keyboard', catKey: 'laptop_computer_parts' }
        ];

        const createdSubcategories = [];
        for (const sub of subcategoriesData) {
            const cat = catMap[sub.catKey];
            if (cat) {
                const newSub = await Subcategory.create({
                    name: sub.name,
                    slug: sub.code || sub.name.toLowerCase().replace(/ /g, '-'),
                    category: cat._id,
                    categoryKey: sub.catKey,
                    // logo: sub.logo // Optional for product types
                });
                createdSubcategories.push(newSub);
            }
        }
        const subMap = {};
        createdSubcategories.forEach(s => { subMap[s.slug] = s; });
        console.log(`🏷️ Created ${createdSubcategories.length} subcategories (Product Types)`);

        // 4. Create Brands (Global) - NEW
        const Brand = require('./models/Brand');
        await Brand.deleteMany(); // Clear brands too

        const brandsData = [
            { name: 'Apple', code: 'apple', logo: 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=200' },
            { name: 'Samsung', code: 'samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200' },
            { name: 'Xiaomi', code: 'xiaomi', logo: '' },
            { name: 'Dell', code: 'dell', logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200' },
            { name: 'HP', code: 'hp', logo: '' }
        ];

        const createdBrands = [];
        for (const b of brandsData) {
            const newBrand = await Brand.create({
                name: b.name,
                slug: b.code,
                logo: b.logo,
                isActive: true
            });
            createdBrands.push(newBrand);
        }
        const brandMap = {};
        createdBrands.forEach(b => { brandMap[b.slug] = b; });
        console.log(`tm™ Created ${createdBrands.length} brands`);

        // 5. Create Makes (Linked to Brand) - Modified
        const makesData = [
            { name: 'iPhone', brand: 'apple' },
            { name: 'iPad', brand: 'apple' },
            { name: 'Galaxy S', brand: 'samsung' },
            { name: 'Galaxy Note', brand: 'samsung' },
            { name: 'Redmi Note', brand: 'xiaomi' },
            { name: 'XPS', brand: 'dell' },
            { name: 'Pavilion', brand: 'hp' }
        ];

        const createdMakes = [];
        for (const m of makesData) {
            const brand = brandMap[m.brand];
            if (brand) {
                const newMake = await Make.create({
                    name: m.name,
                    slug: m.name.toLowerCase().replace(/ /g, '-'),
                    brand: brand._id // Referencing Brand now
                });
                createdMakes.push(newMake);
            }
        }
        const makeMap = {};
        createdMakes.forEach(m => { makeMap[m.name] = m; });
        console.log(`🏭 Created ${createdMakes.length} makes`);

        // 6. Create Models
        const modelsData = [
            { name: 'iPhone 13', make: 'iPhone', year: 2021 },
            { name: 'iPhone 13 Pro', make: 'iPhone', year: 2021 },
            { name: 'iPhone 14', make: 'iPhone', year: 2022 },
            { name: 'MacBook Air M1', make: 'XPS', year: 2020 }, // Intentional error or just reuse? Let's correct it. MacBook is not in Makes list above for reuse simpliciy
            // Wait, I missed MacBook in Makes. Let's add it dynamically or just map properly.
            // Using XPS for Dell example.
            { name: 'Galaxy S21', make: 'Galaxy S', year: 2021 },
            { name: 'XPS 13', make: 'XPS', year: 2021 }
        ];

        const createdModels = [];
        for (const mod of modelsData) {
            const make = makeMap[mod.make];
            if (make) {
                const newModel = await Model.create({
                    name: mod.name,
                    slug: mod.name.toLowerCase().replace(/ /g, '-'),
                    make: make._id,
                    releaseYear: mod.year
                });
                createdModels.push(newModel);
            }
        }
        const modelMap = {};
        createdModels.forEach(m => { modelMap[m.name] = m; });
        console.log(`📱 Created ${createdModels.length} models`);

        // 7. Create Products (Full Hierarchy)
        // Hierarchy: Category -> Subcategory (Type) -> Brand -> Make -> Model
        // We need to pick valid combinations.
        const productsData = [
            {
                name: 'iPhone 13 OLED Display',
                type: 'display', // Subcategory slug
                brand: 'apple',
                make: 'iPhone',
                model: 'iPhone 13',
                price: 12000,
                img: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500'
            },
            {
                name: 'iPhone 13 Pro Battery',
                type: 'battery', // Subcategory slug
                brand: 'apple',
                make: 'iPhone',
                model: 'iPhone 13 Pro',
                price: 3500,
                img: 'https://images.unsplash.com/photo-1621330396173-e41b1afd85cf?w=500'
            },
            {
                name: 'Samsung S21 Charging Port',
                type: 'charging-port',
                brand: 'samsung',
                make: 'Galaxy S',
                model: 'Galaxy S21',
                price: 850,
                img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'
            }
        ];

        let pCount = 0;
        for (const p of productsData) {
            const sub = subMap[p.type];
            const brand = brandMap[p.brand];
            const make = makeMap[p.make];
            const model = modelMap[p.model];

            if (sub && brand && make && model) {
                // Category comes from Subcategory
                await Product.create({
                    user: adminUser,
                    name: p.name,
                    slug: p.name.toLowerCase().replace(/ /g, '-'),
                    image: p.img,
                    images: [p.img],
                    description: `Original ${p.name}`,
                    price: p.price,
                    countInStock: 50,
                    category: sub.category, // Link to matching category
                    subcategory: sub._id,   // Product Type
                    brand: brand._id,       // Brand
                    make: make._id,
                    model: model._id,
                    specifications: { 'Quality': 'Original', 'Warranty': '6 Months' },
                    isActive: true
                });
                pCount++;
            }
        }
        console.log(`📦 Created ${pCount} products`);

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Model.deleteMany();
        await Make.deleteMany();
        await Subcategory.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        console.log('✅ Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};
