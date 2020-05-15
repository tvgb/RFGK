const mongoose = require('mongoose');

const ScorecardSchema = mongoose.Schema({
    datetime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    rounds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    }]
});

module.exports = mongoose.model('Scorecard', ScorecardSchema);