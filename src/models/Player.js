const sequalize = require('../database/connection');
const Sequelize =  require('sequelize');


module.exports = sequalize.define('Player', {
	id: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	first_name: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	last_name: {
		type: Sequelize.STRING(100),
		allowNull: false
	},
	email: {
		type: Sequelize.STRING(100),
		allowNull: false,
		uniqe: true
	},
	password: {
		type: Sequelize.STRING(300),
		allowNull: false
	},
	admin: {
		type: Sequelize.TINYINT,
		allowNull: false
	},
	birthday: {
		type: Sequelize.DATE,
		allowNull: false
	} 
});