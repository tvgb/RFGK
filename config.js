require('dotenv').config();

const config = {
    app: {
        port: 3000
    },
    db: {
        host: '158.38.166.221',
        password: process.env.DATABASE_PASSWORD,
        user: 'Trym',
        database: 'rfgk'
    }
};


module.exports = config;