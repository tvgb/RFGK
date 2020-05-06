const mongoose = require('mongoose');

const PlayerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    admin: {
        type: Boolean,
        default: 0,
        required: true
    },
    birthday: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: 0,
        required: true
    },
    verificationToken: {
        type: String,
        required: false,
        select: false
    }
});

module.exports = mongoose.model('Player', PlayerSchema);