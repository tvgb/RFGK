//package imports
const express = require('express');
const bodyParser = require('body-parser');
let cors = require('cors')
require('./src/bootstrap')(); // Bootstrap for sequalize

//route imports
const roundRoutes = require('./api/routes/rounds');
const playerRoutes = require('./api/routes/players');
const courseRoutes = require('./api/routes/course');
const scorecardRoutes = require('./api/routes/scorecard');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use('/api/rounds', roundRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/scorecard', scorecardRoutes);

app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Hello world!'
    })
});

app.use((req, res, next) => {
   const error = new Error('Not found');
   error.status = 404;
   next(error);
});

app.use((error, req, res, next) => {
   res.status(error.status || 500);
   res.json({
       error: {
           message: error.message
       }
   })
});

module.exports = app;
