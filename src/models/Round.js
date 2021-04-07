const mongoose = require('mongoose');

const RoundSchema = mongoose.Schema({
    datetime: {
        type: Date,
        required: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
	weather: {
		type: String	
	},
    numberOfThrows: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{Value} is not an integer'
        },
        required: true
    },
});
module.exports = mongoose.model('Round', RoundSchema);
