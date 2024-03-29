const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    holes: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{Value} is not an integer'
        },
        required: true
    },
    par: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{Value} is not an integer'
        },
        required: true
    },
	isInactive: {
		type: Boolean,
		required: false,
		default: false
	}
});

module.exports = mongoose.model('Course', CourseSchema);