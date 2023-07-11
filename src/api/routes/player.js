const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../models/Player');
const EmailService = require('../../services/emailService');
const TokenService = require('../../services/tokenService');
const RevokedRefreshTokens = require('../../models/RevokedRefreshTokens');

// Get all players
router.get('/', checkAuth, async (req, res) => {
	try {
		const players = await Player.find();
		return res.json(players);
	} catch (error) {
		res.json(error);
	}
});

router.get('/current', checkAuth, async (req, res) => {
	const playerId = req.userData._id;

	try {
		const player = await Player.findById(playerId);
		return res.json(player);
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

router.post('/signup', async (req, res) => {

	if (process.env.SECRET_CODE === req.body.secret_code) {

		const player = await Player.findOne({
			email: req.body.email
		});

		// Player with the same email already exists in the database
		if (player !== null) {
			return res.sendStatus(409);

		} else {
			bcrypt.hash(req.body.password, 10, async (error, hash) => {

				// Something went wrong while trying to hash the password
				if (error) {
					console.log(error);
					return res.sendStatus(500);
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

						return res.sendStatus(200);
					}


				} catch (error) {
					console.log(error);

					return res.sendStatus(500);
				}
			});
		}
	} else {
		// Wrong secret code
		return res.sendStatus(418);
	}
});

router.post('/login', async (req, res) => {

	try {
		const email = req.body.email.toLowerCase();

		const query = Player.findOne({
			email: email
		});

		query.select('+password');
		query.populate({ path: 'favouriteCourse' });

		let player = await query.exec();

		// Email does not exist in database
		if (player === null) {
			return res.sendStatus(400);
		}

		// Compare password with password in database, and return signed token if equal
		await bcrypt.compare(req.body.password, player.password, async (error, result) => {

			// Something went wrong while trying to compare hashes
			if (error) {
				console.log(error);
				return res.sendStatus(401);
			}

			if (result) {
				const access_token = TokenService.createAccessToken(player);
				const refresh_token = TokenService.createRefreshToken(player);

				res.cookie('access_token', access_token, TokenService.createAccessTokenCookieOptionsObj());
				res.cookie('refresh_token', refresh_token, TokenService.createRefreshTokenCookieOptionsObj());
				res.status(200);
				res.json(
					{
						favouriteCourse: player.favouriteCourse,
						showLatestYearOnly: player.showLatestYearOnly,
						recieveAddedToScorecardMail: player.recieveAddedToScorecardMail,
						isVerified: player.isVerified
					});
				return res.send();
			}

			// Password was incorrect
			return res.sendStatus(400);
		});

	} catch (error) {
		// Something went wrong while trying to get player from database
		console.log(error);
		return res.sendStatus(500);
	}
});

router.post('/logout', async (req, res) => {
	const refresh_token = req.cookies.refresh_token;

	try {
		jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
		const revokedTokens = await RevokedRefreshTokens.findOne();
		const newRevokedTokens = revokedTokens.tokens.filter((token) => {
			try {
				jwt.verify(token, process.env.JWT_REFRESH_SECRET);
				return token;
			} catch (error) {
				// do noting
			}
		});

		revokedTokens.tokens = [...newRevokedTokens, refresh_token];
		revokedTokens.save();

	} catch (error) {
		// do nothing		
	}

	return res.sendStatus(200);
});

router.post('/refreshToken', async (req, res) => {
	try {
		const refresh_token = req.cookies.refresh_token;
		const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
		const revokedTokens = await RevokedRefreshTokens.findOne();


		if (refresh_token && (!revokedTokens || !revokedTokens.tokens.includes(refresh_token))) {

			const access_token = TokenService.createAccessToken({ _id: decoded._id });
			res.cookie('access_token', access_token, TokenService.createAccessTokenCookieOptionsObj());

			const query = Player.findById(decoded._id);
			query.populate({ path: 'favouriteCourse' });
			const player = await query.exec();

			res.status(200);
			return res.json({
				isVerified: player.isVerified,
				favouriteCourse: player.favouriteCourse,
				recieveAddedToScorecardMail: player.recieveAddedToScorecardMail,
				showLatestYearOnly: player.showLatestYearOnly
			});
		} else {
			return res.sendStatus(403);
		}
	} catch (error) {
		console.log(error);
		return res.sendStatus(403);
	}

});

router.get('/verify/:verificationToken', async (req, res) => {

	try {
		const token = req.params.verificationToken;
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
		req.userData = decoded;
	} catch (error) {
		return res.sendStatus(401);
	}

	let player = await Player.findById(req.userData._id).select('+verificationToken');

	// Email does not exist in database
	if (player === null) {
		return res.sendStatus(400);
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

			return res.sendStatus(500);
		}
	} else {
		return res.sendStatus(400);
	}
});

router.put('/updatePersonalInfo', checkAuth, async (req, res) => {

	try {
		const query = Player.findById(req.userData._id);
		query.select('+password');
		let player = await query.exec();

		if (req.body.newPassword && req.body.newPassword.trim() !== '' && req.body.newPassword.length >= 8) {
			const result = await bcrypt.compare(req.body.oldPassword, player.password);

			if (!result) {
				return res.sendStatus(400);
			}

			const hash = await bcrypt.hash(req.body.newPassword, 10);

			if (!hash) {
				return res.sendStatus(500);
			}

			player.password = hash;
		}

		if (req.body.newEmail && req.body.newEmail.trim() !== '') {
			player.email = req.body.newEmail.toLowerCase();
			player.isVerified = false;
			player.deletePlayerIfNotVerified = false;
		}

		const updatedPlayer = await player.save();
		res.status(200);
		return res.json(
			{
				'favouriteCourse': updatedPlayer.favouriteCourse,
				'showLatestYearOnly': updatedPlayer.showLatestYearOnly,
				'recieveAddedToScorecardMail': updatedPlayer.recieveAddedToScorecardMail
			}
		);

	} catch (error) {
		return res.sendStatus(500);
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
		return res.sendStatus(500);
	}
});

router.put('/resetPassword', checkAuth, async (req, res) => {

	res.cookie('access_token', '', { maxAge: 0 });
	res.cookie('refresh_token', '', { maxAge: 0 });

	try {
		const query = Player.findById(req.userData._id);
		query.select('+verificationToken');
		const player = await query.exec();

		if (player && req.body.password && req.cookies.access_token !== player.verificationToken) {

			bcrypt.hash(req.body.password, 10, async (error, hash) => {
				if (error) {
					console.log(error);
					return res.sendStatus(500);
				}

				player.password = hash;
				player.isVerified = true;
				player.verificationToken = req.cookies.access_token;
				const updatedPlayer = await player.save();

				if (updatedPlayer) {
					res.status(200);
					return res.json({
						email: player.email
					});
				} else {
					return res.sendStatus(500);
				}
			});
		} else {
			return res.sendStatus(403);
		}
	} catch (error) {
		return res.sendStatus(500);
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

			return res.sendStatus(200);
		}

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.get('/verifyResetPassword/:verificationToken', async (req, res) => {
	try {
		const token = req.params.verificationToken;
		const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
		req.userData = decoded;

		res.cookie('access_token', token, TokenService.createAccessTokenCookieOptionsObj());

		res.redirect(`${process.env.FRONTEND_URL}/resetPassword`);
	} catch (error) {
		return res.sendStatus(401);
	}

});

router.put('/sendResetPasswordEmail', async (req, res) => {
	try {
		const player = await Player.findOne({
			email: req.body.email
		});

		if (player) {
			const verificationToken = jwt.sign({
				email: player.email,
				_id: player._id
			},
				process.env.JWT_ACCESS_SECRET,
				{
					expiresIn: '24h'
				}
			);
			await EmailService.sendResetPasswordEmail(
				'ikkesvar@ronvikfrisbeegolf.no',
				player.email,
				player.firstName,
				verificationToken
			);
		} else {
			console.log('No player with that email exists!');
		}

		res.sendStatus(200);

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});



module.exports = router;