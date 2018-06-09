const express = require('express');
const path = require('path');

const app = express();


app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/static_html/index.html'));
});

app.get('/Volleydisc', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/public/static_html/Volleydisc.html'));
});


module.exports = app;