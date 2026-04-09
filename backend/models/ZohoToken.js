const mongoose = require('mongoose');

const zohoTokenSchema = mongoose.Schema({
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

const ZohoToken = mongoose.model('ZohoToken', zohoTokenSchema);

module.exports = ZohoToken;
