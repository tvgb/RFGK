const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../models/Player');
//let players = require('../../data/rfgk_Player.json');


// Get all players
router.get('/', async (req, res) =>  {
	try {
		const players = await Player.find();
		return res.json(players);
	} catch (error) {
		res.json(error);
	}
});

// Get player with id "player_id"
router.get('/:player_id', async (req, res) => {
	const playerId = req.params.player_id;
	try {
		const player = await Player.findById(playerId);
		return res.json(player);
	} catch (error) {
		res.json(error);
	}
});

// router.get('/with_rounds/:course_id/:year', (req, res, next) => {
// 	const course_id = req.params.course_id;
// 	const year = req.params.year;

// 	Player.findAll({
// 		include: [{
// 			model: Round,
// 			where: sequalize.where(sequalize.fn('YEAR', sequalize.col('date')), '=', year)
// 		}]
// 	}).then(players => {
// 		res.json(players);
// 	}).catch(err => {
// 		console.log(`Failed getting players with rounds: ${err}`);
// 		res.sendStatus(500);
// 		return;
// 	});
// });

// router.get('/leaderboard/avg/:course_id', (req, res, next) => {
//     const course_id = req.params.course_id;
//     const query =  `SELECT Player.first_name, Player.last_name, Course.name, Course.par, AVG(Round.number_of_throws) AS avg
//         			FROM Round
//         				INNER JOIN Course ON Round.course_id = Course.id
//         				INNER JOIN Player ON Round.player_id = Player.id
//         			WHERE Round.course_id = 1
//         			GROUP BY player_id
//         			ORDER BY avg;`;

//     pool.query(query, [course_id], (err, rows, fields) => {
//         if (err) {
//             console.log("Failed to get leaderbord: " + err);
//             res.sendStatus(500);
//             return;
//         }

//         res.json(rows);
//     });
// });

// router.get('/leaderboard/best/:course_id', (req, res, next) => {
// 	const course_id = req.params.course_id;

//     const query =  `SELECT Player.first_name, Player.last_name, Course.name, Course.par,
//         			DATE_FORMAT(MAX(Round.date), '%d-%m-%Y') AS date, MIN(Round.number_of_throws) AS throws
//         			FROM Round
//         				INNER JOIN Course ON Round.course_id = Course.id
//         				INNER JOIN Player ON Round.player_id = Player.id
//         			WHERE Round.course_id = 1
//         			GROUP BY
//         			Round.player_id
//         			ORDER BY throws;`;

//     pool.query(query, [course_id], (err, rows, fields) => {
//         if (err) {
//             console.log("Failed to get leaderbord: " + err);
//             res.sendStatus(500);
//             return;
//         }

//         res.json(rows);
//     });
// });



/**
 * errorcode: 1 == Wrong secret code
 * errorcode: 2 == Email already exists in database
 * errorcode: 3 == Something went wrong
 */
router.post('/signup', async (req, res) => {

	if (process.env.SECRET_CODE === req.body.secret_code) {
		
		const player = await Player.findOne({
			email: req.body.email
		});
		
		// Player with the same email already exists in the database
		if (player !== null) {
			return res.status(409).json({
				errorcode: 2
			});

		} else {
			bcrypt.hash(req.body.password, 10, async (error, hash) => {

				// Something went wrong while trying to hash the password
				if (error) {
					console.log(error);

					return res.status(500).json({
						errorcode: 3
					});
				}

				const newPlayer = new Player({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: hash,
					birthday: req.body.birthday
				});
				
				try {
					await newPlayer.save();
					return res.status(200).json({
						message: 'Created new player!'
					});
				} catch (error) {
					console.log(error);

					// Something went wrong while storing the new player in the database
					return res.status(500).json({
						errorcode: 3
					});
				}
			});
		}
	} else {
		// Wrong secret code
		return res.status(418).json({
			errorcode: 1
		});
	}
});

/**
 * errorcode: 1 == Wrong email or password
 * errorcode: 2 == Auth failed while trying to compare hashes
 * errorcode: 3 == Something went wrong
 */
router.post('/login', async (req, res) => {
	
	try {
		const player = await Player.findOne({
			email: req.body.email
		}).select('+password');

		// Email does not exist in database
		if (player === null) {
			return res.status(400).json({
				errorcode: 1
			});
		}

		// Compare password with password in database, and return signed token if equal
		bcrypt.compare(req.body.password, player.password, (error, result) => {

			// Something went wrong while trying to compare hashes
			if (error) {
				console.log(error);

				return res.status(401).json({
					errorcode: 2
				});
			}

			if (result) {
				const token = jwt.sign({
					id: player.id,
					first_name: player.firstName,
					last_name: player.lastName,
					email: player.email,
					birthday: player.birthday
				},
				process.env.JWT_KEY,
				{
					expiresIn: '12h'
				}
				);
				return res.status(200).json({
					token: token,
					player: {
						id: player.id,
						first_name: player.firstName,
						last_name: player.lastName,
						email: player.email,
						birthday: player.birthday
					}
				});
			}
			
			// Password was incorrect
			return res.status(400).json({
				errorcode: 1
			});
		});

	} catch (error) {

		// Something went wrong while trying to get player from database
		console.log(error);

		return res.status(500).json({
			errorcode: 3
		});
	}
});

// /**
//  * errorcode: 1 == No player with that id in database
//  * errorcode: 2 == Wrong old password
//  * errorcode: 3 == Failed hashing old password
//  * errorcode: 4 == Failed while updating info
//  * errorcode: 5 == Something went wrong
//  */
// router.put('/updateInfo', checkAuth, (req, res, next) => {

// 	Player.findOne({
// 		where: {
// 			id: req.userData.id
// 		}
// 	}).then(player => {
// 		bcrypt.compare(req.body.oldPassword, player.password, (err, result) => {
// 			if (!result) {
// 				return res.status(418).json({
// 					message: 'Wrong password',
// 					errorcode: 2
// 				});
// 			}

// 			bcrypt.hash(req.body.newPassword, 10, (err, hash) =>{
// 				if (err) {
// 					return res.status(500).json({
// 						message: 'Something went wrong',
// 						error: err,
// 						errorcode: 5
// 					});
// 				}

// 				let fieldsToUpdate = [];

// 				if (req.body.newEmail !== '') { fieldsToUpdate.push('email'); }
// 				if (req.body.newPassword !== '') { fieldsToUpdate.push('password'); };

// 				player.update({
// 					email: req.body.newEmail,
// 					password: hash
// 				}, {
// 					fields: fieldsToUpdate
// 				}).then(updatedPlayer => {
// 					const token = jwt.sign({
// 						id: updatedPlayer.id,
// 						first_name: updatedPlayer.first_name,
// 						last_name: updatedPlayer.last_name,
// 						email: updatedPlayer.email,
// 						birthday: updatedPlayer.birthday
// 					},
// 					process.env.JWT_KEY,
// 					{
// 						expiresIn: '1h'
// 					}
// 					);

// 					return res.status(200).json({
// 						message: 'Info updated!',
// 						token: token,
// 						player: {
// 							id: updatedPlayer.id,
// 							first_name: updatedPlayer.first_name,
// 							last_name: updatedPlayer.last_name,
// 							email: updatedPlayer.email,
// 							birthday: updatedPlayer.birthday
// 						}
// 					});

// 				}).catch(err => {
// 					console.log(`Failed while updating info: ${err}`)
// 					return res.status(500).json({
// 						message: `Failed while updating info: ${err}`,
// 						error: err,
// 						errorcode: 4
// 					});
// 				});
// 			});
// 		});

// 	}).catch(err => {
// 		console.log(`No player with id: ${req.userData.id} in database.`);
// 		return res.status(500).json({
// 			message: `No player with id: ${req.userData.id} in database.`,
// 			error: err,
// 			errorcode: 1
// 		});
// 	})

// });

// router.put('/newpassword', (req, res, next) => {
// 	let newpassword = req.body.newpassword
// 	let playerId = req.body.playerId

// 	console.log(newpassword, playerId)

// 	Player.findOne({
// 		where: {
// 			id: playerId
// 		}
// 	}).then( player => {
// 		bcrypt.hash(newpassword, 10, (err, hash) => {
// 			player.update({
// 				password: hash
// 			}, {
// 				fields: ['password']
// 			}).then(updatedPlayer => {
// 				console.log(updatedPlayer)
// 			})
// 		})
// 	})
// })

module.exports = router;