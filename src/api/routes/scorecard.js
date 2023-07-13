const express = require('express');
const router = express.Router();
const Round = require('../../models/Round');
const Scorecard = require('../../models/Scorecard');
const checkAuth = require('../middleware/check-auth');
const Player = require('../../models/Player');

const moment = require('moment');


// GET all existing scorecards.
router.get('/', async (req, res) => {

	try {
		const query = Scorecard.find({});

		query.sort({ 'datetime': -1 });
		query.populate({ path: 'createdBy' });
		query.populate({ path: 'course' });
		query.populate({
			path: 'rounds',
			populate:
				[{
					path: 'player'
				}]
		});

		// Get round by year if optional query param year is set

		if (req.query.year && req.query.year !== 'all') {
			const year = parseInt(req.query.year, 10);
			const startDate = moment(`${year}-01-01`, moment.DATE);
			const endDate = moment(`${year + 1}-01-01`, moment.DATE).add(-1, 'days');

			query.where('datetime').gte(startDate).lte(endDate);
		}

		// Get round by course if optional query param course is set
		if (req.query.courseId && req.query.courseId !== 'all') {
			const courseId = req.query.courseId;
			query.where({
				'course': courseId
			});
		}

		const scorecards = await query.exec();

		return res.status(200).json(scorecards);


	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});


// POST new scorecard.
router.post('/', checkAuth, async (req, res) => {

	try {
		const authenticatedPlayer = await Player.findById(req.userData._id);

		if (!authenticatedPlayer.isVerified) {
			res.status(405);
			return res.send();
		}

		let roundIds = [];
		const course = req.body.course;
		const datetime = req.body.datetime;

		for (const round of req.body.rounds) {
			const newRound = new Round({
				datetime: datetime,
				weather: req.body.weather,
				player: round.player._id,
				course: course._id,
				numberOfThrows: course.par + round.sum
			});

			const player = await Player.findById(round.player._id);
			console.log('🚀 ~ file: scorecard.js:84 ~ router.post ~ player:', player);

			if (course._id === '62b4199accd73fe51e870525' && player.engaHandicapRating) {
				newRound.handicapRating = player.engaHandicapRating;
			}

			const savedNewRound = await newRound.save();
			roundIds.push(savedNewRound._id);

			// Calculate new handicap rating for player if round is played on Enga

			if (course._id !== '62b4199accd73fe51e870525') {
				continue;
			}

			const query = Round.find();
			query.sort({ 'datetime': 1 });
			query.populate({ path: 'course' });
			query.where({
				'course': '62b4199accd73fe51e870525', // Enga course id,
				'player': round.player._id
			});
			query.limit(20);

			const allPlayerRoundsOnEnga = await query.exec();
			console.log('🚀 ~ file: scorecard.js:109 ~ router.post ~ allPlayerRoundsOnEnga:', allPlayerRoundsOnEnga);

			// Handicap rating cannot be calculated if player has less than 3 rounds on Enga
			if (allPlayerRoundsOnEnga.length < 3) {
				continue;
			}

			const engaHandicapRating = calculateHandicapRating(allPlayerRoundsOnEnga);
			console.log('🚀 ~ file: scorecard.js:117 ~ router.post ~ engaHandicapRating:', engaHandicapRating);



			// LHI cannot be calculated if player has less than 20 rounds on Enga
			if (allPlayerRoundsOnEnga.length < 20) {

				player.engaHandicapRating = Math.min(engaHandicapRating, 54);
				await player.save();
				continue;
			}

			console.log('The thing thinks that there are more than 20 rounds on Enga');

			if (!player.engaLHI) {
				player.engaLHI = engaHandicapRating;
				player.engaLHICalculationDate = datetime;
			} else if (player.engaLHI && moment(datetime).diff(moment(player.engaLHICalculationDate), 'days') > 365) {
				const query = Round.find();
				query.sort({ 'handicapRating': -1 });
				query.where({
					'course': '62b4199accd73fe51e870525', // Enga course id
					'datetime': { $gte: moment(datetime).add(-1, 'years') }
				});
				query.limit(1);

				const lastYearBestRound = await query.exec();
				player.engaLHI = lastYearBestRound.handicapRating;
				player.engaLHICalculationDate = datetime;
			}

			let newHandicapRating = engaHandicapRating;
			console.log('🚀 ~ file: scorecard.js:149 ~ router.post ~ newHandicapRating:', newHandicapRating);



			if (engaHandicapRating - player.engaLHI >= 5) {
				newHandicapRating = player.engaLHI + 5;
			} else if (engaHandicapRating - player.engaLHI >= 3) {
				newHandicapRating = player.engaLHI + 3;
				newHandicapRating += (engaHandicapRating - newHandicapRating) / 2;
			}

			newHandicapRating = Math.round(newHandicapRating * 10) / 10;

			player.engaHandicapRating = Math.min(newHandicapRating, 54);
			await player.save();
		}

		const newScorecard = new Scorecard({
			datetime: datetime,
			weather: req.body.weather,
			createdBy: req.userData._id,
			course: course._id,
			rounds: roundIds
		});
		console.log('🚀 ~ file: scorecard.js:173 ~ router.post ~ newScorecard:', newScorecard);



		const storedScorecard = await newScorecard.save();
		console.log('🚀 ~ file: scorecard.js:178 ~ router.post ~ storedScorecard:', storedScorecard);

		return res.json(storedScorecard);

	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});

function calculateHandicapRating(rounds) {
	const ordered_rows = rounds.sort((a, b) => (getScore(a)) - (getScore(b)));

	if (ordered_rows.length === 3) {
		return getScore(ordered_rows[0]) - 2;
	}

	if (ordered_rows.length === 4) {
		return getScore(ordered_rows[0]) - 1;
	}

	if (ordered_rows.length === 5) {
		return getScore(ordered_rows[0]);
	}

	if (ordered_rows.length === 6) {
		const two_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 2);
		return (two_lowest_scores.reduce((a, b) => a + b, 0) / 2) - 1;
	}

	if (ordered_rows.length >= 7 && ordered_rows.length <= 8) {
		const two_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 2);
		return two_lowest_scores.reduce((a, b) => a + b, 0) / 2;
	}

	if (ordered_rows.length >= 9 && ordered_rows.length <= 11) {
		const three_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 3);
		return three_lowest_scores.reduce((a, b) => a + b, 0) / 3;
	}

	if (ordered_rows.length >= 12 && ordered_rows.length <= 14) {
		const four_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 4);
		return four_lowest_scores.reduce((a, b) => a + b, 0) / 4;
	}

	if (ordered_rows.length >= 15 && ordered_rows.length <= 16) {
		const five_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 5);
		return five_lowest_scores.reduce((a, b) => a + b, 0) / 5;
	}

	if (ordered_rows.length >= 17 && ordered_rows.length <= 18) {
		const six_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 6);
		return six_lowest_scores.reduce((a, b) => a + b, 0) / 6;
	}

	if (ordered_rows.length === 19) {
		const seven_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 7);
		return seven_lowest_scores.reduce((a, b) => a + b, 0) / 7;
	}

	const eight_lowest_scores = ordered_rows.map((row) => getScore(row)).slice(0, 8);
	return eight_lowest_scores.reduce((a, b) => a + b, 0) / 8;
}

function getScore(round) {
	return round.numberOfThrows - round.course.par;
}

module.exports = router;