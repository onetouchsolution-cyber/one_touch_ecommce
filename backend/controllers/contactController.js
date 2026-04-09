const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const contact = await Contact.create({
        name,
        email,
        subject,
        message,
    });

    res.status(201).json(contact);
});

module.exports = {
    createContact,
};
