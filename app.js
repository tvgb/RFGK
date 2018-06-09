const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();


app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
    console.log("Someone visited");
    res.sendFile(path.join(__dirname + '/public/static_html/index.html'));
});

app.get('/Volleydisc', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/Volleydisc.html'));
});

app.use('/html', router);

module.exports = app;