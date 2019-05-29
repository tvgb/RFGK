//package imports
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
let cors = require('cors')

//route imports
const roundRoutes = require('./api/routes/rounds');
const playerRoutes = require('./api/routes/players');
const courseRoutes = require('./api/routes/course');
const scorecardRoutes = require('./api/routes/scorecard');

//Db impots
const db = require('./src/database/connection');
const bs = require('./src/bootstrap')();

const app = express();

app.use(cors());


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/rounds', roundRoutes);
app.use('/players', playerRoutes);
app.use('/courses', courseRoutes);
app.use('/scorecard', scorecardRoutes);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/static_html/index.html'));
});

app.get('/Volleydisc', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/Volleydisc.html'));
});

app.get('/top10', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/top10.html'));
});

app.get('/leaderboard', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/leaderboard.html'));
});

app.get('/admin', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/admin.html'));
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
