const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/one_touch_solution', {
            // These are default in newer mongoose versions but good to be explicit if needed, 
            // though explicitly deprecated options should be avoided.
            // Keeping it simple for now.
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
