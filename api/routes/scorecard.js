const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', (req, res, next) =>  {

    const query =  `SELECT Scorecard.id, DATE_FORMAT(date_time, "%d-%m-%Y %T") AS date, Player.first_name, Player.last_name
					FROM Scorecard
						INNER JOIN Player ON Scorecard.created_by = Player.id
					ORDER BY UNIX_TIMESTAMP(date_time) DESC;`;
		
    pool.query(query, (err, rows, fields) => {

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
    const query =  `SELECT Player.first_name, Player.last_name, Course.name, Course.par, Round.number_of_throws, Round.date
					FROM Scorecard
					INNER JOIN Round on Scorecard.id = Round.scorecard_id
					INNER JOIN Course on Round.course_id = Course.id
					INNER JOIN Player on Round.player_id = Player.id
					WHERE scorecard_id = ?
					ORDER BY number_of_throws;`;

    pool.query(query, [scorecard_id], (err, rows, fields) => {

        if (err) {
            console.log("Failed getting all scorecards: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

module.exports = router;