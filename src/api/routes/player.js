const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../models/Player');
const EmailService = require('../../services/emailService');

let validRefreshTokens = [];

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
					email: req.body.email
				},
				process.env.JWT_ACCESS_SECRET,
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
		const email = req.body.email.toLowerCase();

		const query = Player.findOne({
			email: email
		});
		
		query.select('+password');
		query.populate({path: 'favouriteCourse'});
		
		let player = await query.exec();

		// Email does not exist in database
		if (player === null) {
			return res.status(400).json({
				errorcode: 1
			});
		}

		// Compare password with password in database, and return signed token if equal
		await bcrypt.compare(req.body.password, player.password, async (error, result) => {

			// Something went wrong while trying to compare hashes
			if (error) {
				console.log(error);

				return res.status(401).json({
					errorcode: 2
				});
			}

			if (result) {
				const access_token = jwt.sign({
					_id: player._id,
					isVerified:  player.isVerified
				},
				process.env.JWT_ACCESS_SECRET,
				{
					expiresIn: '1h'
				}
				);

				const refresh_token = jwt.sign({
					_id: player._id
				},
				process.env.JWT_REFRESH_SECRET,
				{
					expiresIn: '120d'
				}
				);

				validRefreshTokens.push(refresh_token);

				// Our token expires after one day
				const oneHourToMilliseconds = 1000 * 60 * 60;
				const hundredAndTwentyDaysToMilliseconds = 1000 * 60 * 60 * 24 * 120;

				res.cookie('access_token', access_token,
					{
						maxAge: oneHourToMilliseconds,
						httpOnly: false,
						secure: process.env.MODE === 'production' ? true : false,
						sameSite: 'lax'
					}
				);

				res.cookie('isVerified', player.isVerified,
					{
						maxAge: oneHourToMilliseconds,
						httpOnly: false,
						secure: process.env.MODE === 'production' ? true : false,
						sameSite: 'lax'
					}
				);

				res.cookie('refresh_token', refresh_token,
					{
						maxAge: hundredAndTwentyDaysToMilliseconds,
						httpOnly: false,
						secure: process.env.MODE === 'production' ? true : false,
						sameSite: 'lax'
					}
				);
				
				return res.json(
				{
					'favouriteCourse': player.favouriteCourse,
					'showLatestYearOnly': player.showLatestYearOnly,
					'recieveAddedToScorecardMail': player.recieveAddedToScorecardMail,
					'isVerified': player.isVerified
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

router.post('/logout', (req, res) => {
	const refresh_token = req.cookies.refresh_token;
	validRefreshTokens = validRefreshTokens.filter(token => token !== refresh_token);
	res.status(200);
	return res.send();
});

router.post('/refreshToken', (req, res) => {
	try {
		const refresh_token = req.cookies.refresh_token;
		const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

		if (refresh_token && validRefreshTokens.includes(refresh_token)) {
			const access_token = jwt.sign({
				_id: decoded._id,
				isVerified:  decoded.isVerified
			},
			process.env.JWT_ACCESS_SECRET,
			{
				expiresIn: '1h'
			}
			);

			const oneHourToMilliseconds = 1000 * 60 * 60;
			
			res.cookie('access_token', access_token,
			{
				maxAge: oneHourToMilliseconds,
				httpOnly: false,
				secure: process.env.MODE === 'production' ? true : false,
				sameSite: 'lax'
			}
			);

			res.status(200);
			return res.send();
		} else {

			return res.status(403).json({
				message: 'Auth failed'
			});
		}
	} catch (error) {
		
		console.log(error);
		return res.status(403).json({
			message: 'Auth failed'
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
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
		req.userData = decoded;
	} catch (error) {
		return res.status(401).json({
            message: 'Account verification failed'
        });
	}

	let player = await Player.findById(req.userData._id).select('+verificationToken');

	// Email does not exist in database
	if (player === null) {
		return res.status(400).json({
			errorcode: 1
		});
	}

	if (player.isVerified) {
		return res.redirect(process.env.FRONTEND_URL);
	}

	if (player.verificationToken === req.params.verificationToken) {
		player.isVerified = true;
		player.deletePlayerIfNotVerified = false;

		try {
			await player.save();

			return res.redirect(process.env.FRONTEND_URL);
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
router.put('/updatePersonalInfo', checkAuth, async (req, res) => {

	const query = Player.findById(req.userData._id);
	query.select('+password');
	let player = await query.exec();

	await bcrypt.compare(req.body.oldPassword, player.password, async (error, result) => {
		if (error) {
			console.log(error);

			return res.status(500).json({
				errorcode: 5	
			});
		}

		if (!result) {
			return res.status(400).json({
				errorcode: 2
			});
		}
	});

	if (req.body.newPassword ==! null && req.body.newPassword ==! '' && req.body.newPassword ==! undefined) {
		bcrypt.hash(req.body.newPassword, 10, (error, hash) => {
			if (error) {
				console.log(error);

				return res.status(500).json({
					errorcode: 5
				});
			} 

			player.password = hash;
		});
	}

	if (req.body.newEmail !== null && req.body.newEmail !== undefined && req.body.newEmail.trim() !== '') {
		player.email = req.body.newEmail.toLowerCase();
		player.isVerified = false;
		player.deletePlayerIfNotVerified = false;
	}
	
	try {
		const updatedPlayer = await player.save();

		return res.json(
		{
			'favouriteCourse': updatedPlayer.favouriteCourse,
			'showLatestYearOnly': updatedPlayer.showLatestYearOnly,
			'recieveAddedToScorecardMail': updatedPlayer.recieveAddedToScorecardMail
		});

	} catch (error) {

		return res.status(500).json({
			errorcode: 5
		});
	}
});

router.put('/updateSettings', checkAuth, async (req, res) => {
	try {
		const player = await Player.findById(req.userData._id).populate('favouriteCourse');

		if (req.body.favouriteCourse !== 'all') {
			player.favouriteCourse = req.body.favouriteCourse;
		} else {
			player.favouriteCourse = null;
		}
		player.recieveAddedToScorecardMail = req.body.recieveAddedToScorecardMail;
		player.showLatestYearOnly = req.body.showLatestYearOnly;

		await player.save();

		return res.json(
		{
			'favouriteCourse': player.favouriteCourse,
			'showLatestYearOnly': player.showLatestYearOnly,
			'recieveAddedToScorecardMail': player.recieveAddedToScorecardMail
		});

	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});

router.put('/sendVerificationMail', checkAuth, async (req, res) => {
	try {
		let player = await Player.findById(req.userData._id);

		const verificationToken = jwt.sign({
			email: req.userData._id
		},
		process.env.JWT_ACCESS_SECRET,
		{
			expiresIn: '24h'
		}
		);	

		player.verificationToken = verificationToken;
		player.isVerified = false;

		const updatedPlayer = await player.save();

		if (updatedPlayer) {
			await EmailService.sendVerificationEmail(
				'ikkesvar@ronvikfrisbeegolf.no',
				updatedPlayer.email,
				updatedPlayer.firstName,
				verificationToken
			);

			res.status(200);
			return res.send();
		}

	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});

router.put('/sendResetPasswordEmail', async (req, res) => {
	try {
		let player = await Player.findById(req.userData._id);

		const verificationToken = jwt.sign({
			email: req.userData._id
		},
		process.env.JWT_ACCESS_SECRET,
		{
			expiresIn: '24h'
		}
		);	

		player.verificationToken = verificationToken;
		player.isVerified = false;

		const updatedPlayer = await player.save();

		if (updatedPlayer) {
			await EmailService.sendVerificationEmail(
				'ikkesvar@ronvikfrisbeegolf.no',
				updatedPlayer.email,
				updatedPlayer.firstName,
				verificationToken
			);

			res.status(200);
			return res.send();
		}

	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});

module.exports = router;