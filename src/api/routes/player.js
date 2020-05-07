const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../models/Player');
const Round = require('../../models/Round');
const Scorecard = require('../../models/Scorecard');
const Course = require('../../models/Course');
const EmailService = require('../../services/emailService');
const players = require('../../data/rfgk_Player.json');
const courses = require('../../data/rfgk_Course.json');
const rounds = require('../../data/rfgk_Round.json');
const scorecards = require('../../data/rfgk_Scorecard.json');

router.get('/do', async (req, res) => {
	
	try {
		let playerIdMap = new Map();
		let courseIdMap = new Map();
		let scorecardIdToCardMap = new Map();

		for (const player of players) {
			const newPlayer = new Player({
				firstName: player.first_name,
				lastName: player.last_name,
				email: player.email,
				password: player.password,
				admin: player.admin,
				birthday: player.birthday,
				isVerified: true,
				verificationToken: player.verification_hash,
				deletePlayerIfNotVerified: false
			});

			const savedNewPlayer = await newPlayer.save();

			playerIdMap.set(player.id, savedNewPlayer._id);
		}

		for (const course of courses) {
			const newCourse = new Course({
				name: course.name,
				holes: course.holes,
				par: course.par
			});

			const savedNewCourse = await newCourse.save();

			courseIdMap.set(course.id, savedNewCourse._id);
		}

		for (const scorecard of scorecards) {
			const newScorecard = new Scorecard({
				datetime: scorecard.date_time,
				createdBy: playerIdMap.get(scorecard.created_by)
			});
			
			scorecardIdToCardMap.set(scorecard.id, newScorecard);
		}

		for (const round of rounds) {
			const newRound = new Round({
				datetime: round.date,
				player: playerIdMap.get(round.player_id),
				course: courseIdMap.get(round.course_id),
				numberOfThrows: round.number_of_throws
			});
			
			const savedNewRound = await newRound.save();

			scorecardIdToCardMap.get(round.scorecard_id).rounds.unshift(savedNewRound._id);
		}

		for (const scorecard of scorecardIdToCardMap.values()) {
			await scorecard.save();
		}

		return res.status(200).json({
			'message': 'Everything went nicely!'
		});

	} catch (error) {
		console.log(error);

		return res.status(500).json({
			'message': 'Something went wrong!'
		});
	}
	
});

// Get all players
router.get('/', checkAuth, async (req, res) =>  {
	try {
		const players = await Player.find();
		return res.json(players);
	} catch (error) {
		res.json(error);
	}
});

// Get player with id "player_id"
router.get('/:player_id', checkAuth, async (req, res) => {
	const playerId = req.params.player_id;
	try {
		const player = await Player.findById(playerId);
		return res.json(player);
	} catch (error) {
		res.json(error);
	}
});

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

				const verificationToken = jwt.sign({
					email: req.body.email,
				},
				process.env.JWT_KEY,
				{
					expiresIn: '24h'
				}
				);

				const newPlayer = new Player({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: hash,
					birthday: req.body.birthday,
					verificationToken: verificationToken,
					deletePlayerIfNotVerified: true
				});
				
				try {
					const newPlayerSavedSuccessfully = await newPlayer.save();
					
					if (newPlayerSavedSuccessfully) {
						await EmailService.sendVerificationEmail(
							'ikkesvar@ronvikfrisbeegolf.no',
							newPlayer.email,
							newPlayer.firstName,
							verificationToken
						);

						return res.status(200).json({
							message: 'Created new player!'
						});
					}

					
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
 * errorcode: 4 == Account not verified
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

		if (!player.isVerified) {
			return res.status(400).json({
				errorcode: 4
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

/**
 * Verify email
 * 
 * errorcode: 1 == Wrong email
 * errorcode: 2 == Auth failed while trying to compare hashes
 * errorcode: 3 == Something went wrong
 */
router.get('/verify/:verificationToken', async (req, res) => {

	try {
		const token = req.params.verificationToken;
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
	} catch (error) {
		return res.status(401).json({
            message: 'Account verification failed'
        });
	}

	let player = await Player.findOne({
		email: req.userData.email
	}).select('+verificationToken');

	// Email does not exist in database
	if (player === null) {
		return res.status(400).json({
			errorcode: 1
		});
	}

	if (player.isVerified) {
		return res.status(400).json({
            message: 'Account is already verified.'
        });
	}

	if (player.verificationToken === req.params.verificationToken) {
		player.isVerified = true;
		player.deletePlayerIfNotVerified = false;
		
		try {
			await player.save();

			return res.redirect('https://vg.no'); // TODO: Change to redirect to login page
		} catch (error) {
			console.log(error);

			return res.status(500).json({
				errorcode: 3
			});
		}
	} else {
		return res.status(401).json({
            message: 'Account verification failed'
        });
	}
});

/**
 * errorcode: 1 == No player with that id in database
 * errorcode: 2 == Wrong old password
 * errorcode: 3 == Failed hashing old password
 * errorcode: 4 == Failed while updating info
 * errorcode: 5 == Something went wrong
 */
router.put('/updateInfo', checkAuth, async (req, res) => {

	let player = Player.findById(req.userData.id);

	await bcrypt.compare(req.body.oldPassword, player.password, async (error, result) => {
		if (error) {
			console.log(error);

			return res.status(400).json({
				errorcode: 2
			});
		}

		if (result) {

			await bcrypt.hash(req.body.newPassword, 10, async (error, hash) =>{
				if (error) {
					console.log(error);
	
					return res.status(500).json({
						errorcode: 5
					});
				}
				
				if (req.body.newEmail.trim() !== '') {
					player.email = req.body.newEmail;
					player.isVerified = false;
				}

				player.password = hash;
				
				try {
					const updatedPlayer = await player.save();
					
					const token = jwt.sign({
						id: updatedPlayer.id,
						first_name: updatedPlayer.firstName,
						last_name: updatedPlayer.lastName,
						email: updatedPlayer.email,
						birthday: updatedPlayer.birthday
					},
					process.env.JWT_KEY,
					{
						expiresIn: '12h'
					}
					);
	
					return res.status(200).json({
						token: token,
						player: {
							id: updatedPlayer.id,
							first_name: updatedPlayer.firstName,
							last_name: updatedPlayer.lastName,
							email: updatedPlayer.email,
							birthday: updatedPlayer.birthday
						}
					});

				} catch (error) {
					
					return res.status(500).json({
						errorcode: 5
					});
				}
			
			});
		}
	});
});

module.exports = router;