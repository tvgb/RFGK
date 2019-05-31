
module.exports = async() => {
	const Round = require('./models/Round');
	const Scorecard = require('./models/Scorecard');
	const Player = require('./models/Player');
	const Course = require('./models/Course');

	Player.hasMany(Scorecard, {
		foreignKey: 'created_by'
	});

	Scorecard.belongsTo(Player, {
		foreignKey: 'created_by'
	});

	Scorecard.hasMany(Round, {
		foreignKey: 'scorecard_id'
	});

	Round.belongsTo(Scorecard, {
		foreignKey: 'scorecard_id'
	});

	Player.hasMany(Round, {
		foreignKey: 'player_id'
	});

	Round.belongsTo(Player, {
		foreignKey: 'player_id'
	});

	Course.hasMany(Round, {
		foreignKey: 'course_id'
	});

	Round.belongsTo(Course, {
		foreignKey: 'course_id'
	});
}