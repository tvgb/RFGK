const express = require('express');
const router = express.Router();
const Round = require('../../models/Round');
const Scorecard = require('../../models/Scorecard');
const checkAuth = require('../middleware/check-auth');
const moment = require('moment');


// GET all existing scorecards.
router.get('/', async (req, res) =>  {

	try {
		const query = Scorecard.find({});
		
		query.sort({'datetime': -1});
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

		// IMPLEMETER EN EKTE SJEKK FOR VERIFISERTE BRUKERE
		// if (!req.userData.isVerified) {
		// 	res.status(405);
		// 	return res.send();
		// }

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
	
			const savedNewRound = await newRound.save();
	
			roundIds.push(savedNewRound._id);
		}
	
		const newScorecard = new Scorecard({
			datetime: datetime,
			weather: req.body.weather,
			createdBy: req.userData._id,
			course: course._id,
			rounds: roundIds
		});

		const storedScorecard = await newScorecard.save();

		return res.json(storedScorecard);

	} catch (error) {
		console.log(error);

		return res.status(500);
	}
});

module.exports = router;