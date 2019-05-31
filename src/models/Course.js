const sequalize = require('../database/connection');
const Sequelize =  require('sequelize');


module.exports = sequalize.define('Course', {
	id: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	holes: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	par: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	} 
});