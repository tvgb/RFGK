const express = require('express');
const router = express.Router();
const pool = require('../database');
const Scorecard = require('../../src/models/Scorecard');
const Round = require('../../src/models/Round');
const Player = require('../../src/models/Player');
const Course = require('../../src/models/Course');

router.get('/', (req, res, next) =>  {

	Scorecard.findAll({
		attributes: ['date_time'],
		include: [{
			model: Round,
				attributes: [['number_of_throws', 'throws'], 'date'],
				include: [{
					model: Player,
					attributes: ['first_name', 'last_name']
				},
				{
					model: Course,
					attributes: [['name', 'course_name'], 'holes', 'par']
				}]

		},{
			model: Player,
			attributes: ['first_name', 'last_name']
		}],
		order: [['date_time', 'DESC']]
	}).then(scorecards => {
		res.json(scorecards);
	})

    // const query =  `SELECT Scorecard.id, Scorecard.date_time, Player.first_name, Player.last_name
	// 				FROM Scorecard
	// 					INNER JOIN Player ON Scorecard.created_by = Player.id
	// 				ORDER BY UNIX_TIMESTAMP(date_time) DESC;`;
		
    // pool.query(query, (err, rows, fields) => {

    //     if (err) {
    //         console.log("Failed getting all scorecards: " + err);
	// 		res.sendStatus(500);
    //         return;
    //     }

    //     res.json(rows);
    // });
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