const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();


app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/static_html/top10.html'));
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


app.get('/players', (req, res, next) => {
    const query = 'SELECT * FROM Player;';
    const connection = getConnection();

    connection.query(query, (err, rows, fields) => {
       if (err) {
           console.log("Failed getting all players: " + err)
           res.sendStatus(500);
           return;
       }

        res.json(rows);
    });
});

app.get('/player/:id', (req, res, next) => {
    const player_id = req.params.id;
    const query = 'SELECT * FROM Player WHERE id = ?;';
    const connection = getConnection();

    connection.query(query, [player_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting player by id: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

app.get('/rounds/:course_id', (req, res, next) => {
    const course_id = req.params.course_id;
    const query = 'SELECT Player.first_name, Player.last_name, Course.name, Course.par, Round.number_of_throws, Round.date FROM Round INNER JOIN Course ON Round.course_id = Course.id INNER JOIN Player ON Round.player_id = Player.id WHERE Round.course_id = ? ORDER BY number_of_throws LIMIT 10;';
    const connection = getConnection();

    connection.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting all rounds: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

app.get('/leaderboard/:course_id', (req, res, next) => {
   const course_id = req.params.course_id;
   const query = 'SELECT Player.first_name, Player.last_name, Course.name, Course.par, AVG(Round.number_of_throws) AS avg\n' +
       'FROM Round\n' +
       'INNER JOIN Course ON Round.course_id = Course.id\n' +
       'INNER JOIN Player ON Round.player_id = Player.id\n' +
       'WHERE Round.course_id = 1\n' +
       'GROUP BY player_id\n' +
       'ORDER BY avg;';
   const connection = getConnection();

   connection.query(query, [course_id], (err, rows, fields) => {
      if (err) {
          console.log("Feil to get leaderbord: " + err);
          res.sendStatus(500);
          return;
      }

      res.json(rows);
   });
});

function getConnection() {
    const connection = mysql.createConnection({
        host: '158.38.166.221',
        user: 'Trym',
        password: process.env.DATABASE_PASSWORD,
        database: 'rfgk'
    });

    console.log(process.env.DATABASE_PASSWORD);

    return connection;
}

module.exports = app;