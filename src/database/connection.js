const Sequalize = require('sequelize');
const config = require('../../config');

const sequelize = new Sequalize(config.db.database, config.db.user, config.db.password,
	{
		dialect: 'mysql',
		host: config.db.host,
		port: 3306,
		opratorAliases: false,
		define: {
			timestamps: false,

			//prevent sequelize from pluralizing table names
			freezeTableName: true,

			// don't use camelcase for automatically added attributes but underscore style
  			// so updatedAt will be updated_at
			underscored: true
		}
	}
)

module.exports = sequelize;

