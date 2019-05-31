const sequalize = require('../database/connection');
const Sequelize =  require('sequelize');

module.exports = sequalize.define('Round', {
	id: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	date: Sequelize.DATEONLY,
	player_id: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	course_id: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	number_of_throws: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	scorecard_id: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	} 
});