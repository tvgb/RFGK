const sequalize = require('../database/connection');
const Sequelize =  require('sequelize');

module.exports = sequalize.define('Scorecard', {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	date_time: {
		type: Sequelize.DATE,
		allowNull: false
	},
	created_by: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	}
});