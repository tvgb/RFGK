const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config');
const checkAuth = require('../middleware/check-auth');


router.get('/', (req, res, next) =>  {
    const course_id = req.params.course_id;
    const query = 'SELECT id, DATE_FORMAT(date_time, "%d-%m-%Y %T") AS date\n, created_by\n' +
        'FROM Scorecard\n' +
        'ORDER BY Scorecard.date_time DESC;';
    const connection = getConnection();

    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log("Failed getting all scorecards: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

router.get('/:scorecard_id', (req, res, next) =>  {
    const scorecard_id = req.params.scorecard_id;
    const query = `SELECT Player.first_name, Player.last_name, Course.name, Course.par, Round.number_of_throws, Round.date
					FROM Scorecard
					INNER JOIN Round on Scorecard.id = Round.scorecard_id
					INNER JOIN Course on Round.course_id = Course.id
					INNER JOIN Player on Round.player_id = Player.id
					WHERE scorecard_id = ?
					ORDER BY number_of_throws;`;
    const connection = getConnection();

    connection.query(query, [scorecard_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting all scorecards: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
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