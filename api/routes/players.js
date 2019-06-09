const express = require('express');
const router = express.Router();
const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../src/models/Player');
const Scorecard = require('../../src/models/Scorecard');
const Round = require('../../src/models/Round');
const sequalize = require('sequelize');

// Get all players
router.get('/', (req, res, next) =>  {

	Player.findAll({

	}).then(players => {
		res.json(players);
	}).catch(err => {
		console.log(`Failed getting all players: ${err}`);
		res.sendStatus(500);
		return;
	})
});

// Get player with id "player_id"
router.get('/:player_id', (req, res, next) => {
	const player_id = req.params.player_id;
	
	Player.findOne({
		where: {
			id: player_id
		}
	}).then(player => {
		res.json(player);
	}).catch(err => {
		console.log(`Failed getting player with id ${player_id}: ${err}`);
		res.sendStatus(500);
		return;
	})
});

router.get('/isAdmin/:player_id', (req, res, next) => {
	const player_id = req.params.player_id;
	Player.findOne({
		where: {
			id: player_id
		}
	}).then(player => {
		res.json(player.admin);
	}).catch(err => {
		console.log(`Failed getting player with id ${player_id}: ${err}`);
		res.sendStatus(500);
		return;
	})
});

router.get('/with_rounds/:course_id/:year', (req, res, next) => {
	const course_id = req.params.course_id;
	const year = req.params.year;

	Player.findAll({
		include: [{
			model: Round,
			where: sequalize.where(sequalize.fn('YEAR', sequalize.col('date')), '=', year)
		}]
	}).then(players => {
		res.json(players);
	}).catch(err => {
		console.log(`Failed getting players with rounds: ${err}`);
		res.sendStatus(500);
		return;
	});
});

router.get('/leaderboard/avg/:course_id', (req, res, next) => {
    const course_id = req.params.course_id;
    const query =  `SELECT Player.first_name, Player.last_name, Course.name, Course.par, AVG(Round.number_of_throws) AS avg
        			FROM Round
        				INNER JOIN Course ON Round.course_id = Course.id
        				INNER JOIN Player ON Round.player_id = Player.id
        			WHERE Round.course_id = 1
        			GROUP BY player_id
        			ORDER BY avg;`;

    pool.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed to get leaderbord: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

router.get('/leaderboard/best/:course_id', (req, res, next) => {
	const course_id = req.params.course_id;

    const query =  `SELECT Player.first_name, Player.last_name, Course.name, Course.par,
        			DATE_FORMAT(MAX(Round.date), '%d-%m-%Y') AS date, MIN(Round.number_of_throws) AS throws
        			FROM Round
        				INNER JOIN Course ON Round.course_id = Course.id
        				INNER JOIN Player ON Round.player_id = Player.id
        			WHERE Round.course_id = 1
        			GROUP BY
        			Round.player_id
        			ORDER BY throws;`;

    pool.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed to get leaderbord: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});



/**
 * errorcode: 1 == Wrong secred code
 * errorcode: 2 == Email already exists in database
 * errorcode: 3 == Something went wrong
 */
router.post('/signup', (req, res, next) => {
	console.log(req.body.secret_code);
   	if (process.env.SECRET_CODE === req.body.secret_code) {
		
		Player.findOne({
			where: {
				email: req.body.email
			}
		}).then(player => {
			if (player !== null) {
				return res.status(409).json({
					error: 'Mail already exists in database',
					errorcode: 2
				})
			} else {
				bcrypt.hash(req.body.password, 10, (error, hash) => {
				
					Player.create({
						first_name: req.body.firstName,
						last_name: req.body.lastName,
						email: req.body.email,
						password: hash,
						admin: 0,
						birthday: req.body.birthday
					}).then(player => {
						return res.status(200).json({
							message: `Created new player with id: ${player.id}.`,
							player: player
						});
					})
				});
			}
		}).catch(err => {
			return res.status(500).json({
				message: 'Failed while creating new user.',
				error: err,
				errorcode: 3
			});
		})

   	} else {
       	return res.status(418).json({
			message: 'wrong secret code',
			errorcode: 1   
       	});
   	}
});

router.post('/login', (req, res, next) => {
	
	Player.findOne({
		where: {
			email: req.body.email
		}
	}).then(player => {
		// Check if players exists in database
		if (player === null) {
			return res.status(200).json({
				message: "Auth failed"
			});
		}

		// Compare password with password in database, and return signed token if equal
		bcrypt.compare(req.body.password, player.password, (err, result) => {
			if (err) {
				return res.status(401).json({
					message: 'Auth failed'
				});
			}

			if (result) {
				const token = jwt.sign({
					id: player.id,
					first_name: player.first_name,
					last_name: player.last_name,
					email: player.email,
					birthday: player.birthday
				},
				process.env.JWT_KEY,
				{
					expiresIn: "1h"
				}
				);
				return res.status(200).json({
					message: "Auth successful",
					token: token,
					player: {
						id: player.id,
						first_name: player.first_name,
						last_name: player.last_name,
						email: player.email,
						birthday: player.birthday
					}
				})
			}

			return res.status(200).json({
				message: "Auth failed"
			})
		});

	}).catch(err => {
		console.log("Failed to get id and password from user " + err);
		res.sendStatus(500);
		return;
	});

});


router.put('/newpassword', checkAuth, (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (error, hash) => {
        if (error) {
            return res.status(500).json({
                error: error
            })
        } else {

            const query = "UPDATE Player\n" +
                          "SET password = ?\n" +
                          "WHERE id = ?;";
            pool.query(query, [hash, req.userData.id], (err, row, fields) => {
                if (err) {
                    console.log("Failed to create new user: " + err);
                    res.sendStatus(500);
                    return;
                }

                return res.status(200).json({
                    message: 'Password succesfully updated'
                })
            });
        }
    });
});

module.exports = router;