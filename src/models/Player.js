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
        default: false,
        required: true
    },
    birthday: {
        type: Date,
        required: false
    },
    favouriteCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },
    showLatestYearOnly: {
        type: Boolean,
        default: false
    },
    recieveAddedToScorecardMail: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    verificationToken: {
        type: String,
        required: false,
        select: false
    },
    deletePlayerIfNotVerified: {
        type: Boolean,
        required: true,
        default: false,
        select: false
    },
    engaHandicapRating: {
        type: Number,
        required: false,
        default: undefined
    },
    engaLHI: {
        type: Number,
        required: false,
        default: undefined
    },
    engaLHICalculationDate: {
        type: Date,
        required: false,
        default: undefined
    },
});

module.exports = mongoose.model('Player', PlayerSchema);