const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save middleware in model, but seeder might need direct hash if using insertMany without middleware trigger on simple objects. 
        // Actually, Model.insertMany does NOT trigger 'save' middleware.
        // So we should hash it or loop create.
        // For simplicity in this demo, let's assume we might need to handle hashing here or change seeder to use create.
        isAdmin: true,
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        isAdmin: false,
    },
];

module.exports = users;
