const express = require('express');
const router = express.Router();
const Scorecard = require('../../src/models/Scorecard');
const Round = require('../../src/models/Round');
const Player = require('../../src/models/Player');
const Course = require('../../src/models/Course');

// Returns all existing scorecards.
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
	}).catch(function (err) {
		console.log(`Failed getting all scorecards: ${err}`);
		res.sendStatus(500);
		return;
	});
});


// Returns scorecard with id "scorecard_id" if it exists.
router.get('/:scorecard_id', (req, res, next) =>  {
	const scorecard_id = req.params.scorecard_id;
	
	Scorecard.findOne ({
		attributes: ['date_time', 'id'],
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
		where: {
			id: scorecard_id
		}
	}).then(scorecards => {
		res.json(scorecards);
	}).catch(function (err) {
		console.log(`Failed getting scorecard with id ${scorecard_id}: ${err}`);
		res.sendStatus(500);
		return;
	});
});

module.exports = router;