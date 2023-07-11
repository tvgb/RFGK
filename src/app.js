// Get environment variables
require('dotenv').config();

//package imports
const express = require('express');
const cors = require('cors');
//const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


//route imports
const roundRoutes = require('./api/routes/round');
const playerRoutes = require('./api/routes/player');
const courseRoutes = require('./api/routes/course');
const scorecardRoutes = require('./api/routes/scorecard');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_KEY));
//app.use(morgan('comine'));


const cors_config = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
};

app.use(cors(cors_config));

app.use('/api/round', roundRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/scorecard', scorecardRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        message: 'Hello world, now CI and CD works!'
    });
});

app.post('/', (req, res) => {

    return res.status(200).json({
        message: 'testing 123'
    });
});

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Connect mongoose to MongoDB database
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
    console.log('Connected to DB!')
);


module.exports = app;
