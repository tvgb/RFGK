const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config');
const checkAuth = require('../middleware/check-auth');

router.get('/top10/:course_id/', (req, res, next) =>  {
    const course_id = req.params.course_id;
    const query = 'SELECT Player.first_name, Player.last_name, Course.name, Course.par, Round.number_of_throws, DATE_FORMAT(Round.date, "%d-%m-%Y") AS date\n' +
        'FROM Round\n' +
        '  INNER JOIN Course ON Round.course_id = Course.id\n' +
        '  INNER JOIN Player ON Round.player_id = Player.id\n' +
        'WHERE Round.course_id = ?\n' +
        'ORDER BY number_of_throws LIMIT 10;';
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


router.get('/:course_id', (req, res, next) =>  {
    const course_id = req.params.course_id;
    const query = 'SELECT Player.first_name, Player.last_name, Course.name, Course.par, Round.number_of_throws, DATE_FORMAT(Round.date, "%d-%m-%Y") AS date\n' +
        'FROM Round\n' +
        '  INNER JOIN Course ON Round.course_id = Course.id\n' +
        '  INNER JOIN Player ON Round.player_id = Player.id\n' +
        'WHERE Round.course_id = ?\n' +
        'ORDER BY Round.date DESC;';
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

router.post('/', checkAuth, (req, res, next) => {
    const round = {
        player_id: req.body.player_id,
        date: req.body.date,
        course_id: req.body.course_id,
        number_of_throws: req.body.number_of_throws
    };

    const query = "INSERT INTO Round(date, player_id, course_id, number_of_throws) VALUES (?, ?, ?, ?);"
    const connection = getConnection();
    connection.query(query, [round.date, round.player_id, round.course_id, round.number_of_throws], (err, rows, fields) => {
        if (err) {
            console.log("Failed insterting new round " + err);
            return res.status(500).json({
                message: "false"
            });
        }

        return res.status(200).json({
            message: "New round successfully inserted",
            status: "true"
        });
    });
});

function getConnection() {
    const connection = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

    return connection;
}

module.exports = router;