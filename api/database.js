const mysql = require('mysql');
const config = require('../config');


let pool = mysql.createPool({
    connectionLimit: 10,
	host: config.db.host,
	user: config.db.user,
	password: config.db.password,
	database: config.db.database
});

module.exports = pool;