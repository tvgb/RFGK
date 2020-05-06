// const express = require('express');
// const router = express.Router();
// const Scorecard = require('../../src/models/Scorecard');
// const Round = require('../../src/models/Round');
// const Player = require('../../src/models/Player');
// const Course = require('../../src/models/Course');
// const checkAuth = require('../middleware/check-auth');


// // Returns all existing scorecards.
// router.get('/', (req, res, next) =>  {

// 	Scorecard.findAll({
// 		attributes: ['date_time', 'id'],
// 		include: [{
// 			model: Round,
// 			attributes: [['number_of_throws', 'throws'], 'date', 'scorecard_id'],
// 			include: [{
// 				model: Player,
// 				attributes: ['id', 'first_name', 'last_name']
// 			},
// 			{
// 				model: Course,
// 				attributes: ['id', ['name', 'course_name'], 'holes', 'par']
// 			}]

// 		},{
// 			model: Player,	
// 			attributes: ['first_name', 'last_name']
// 		}],
// 		order: [
// 			['date_time', 'DESC'],
// 			[Round, 'number_of_throws', 'ASC']
// 		]
// 	}).then(scorecards => {
// 		res.json(scorecards);
// 	}).catch(function (err) {
// 		console.log(`Failed getting all scorecards: ${err}`);
// 		res.sendStatus(500);
// 		return;
// 	});
// });


// // Returns scorecard with id "scorecard_id" if it exists.
// router.get('/:scorecard_id', (req, res, next) =>  {
// 	const scorecard_id = req.params.scorecard_id;
	
// 	Scorecard.findOne ({
// 		attributes: ['date_time', 'id'],
// 		include: [{
// 			model: Round,
// 				attributes: [['number_of_throws', 'throws'], 'date'],
// 				include: [{
// 					model: Player,
// 					attributes: ['first_name', 'last_name']
// 				},
// 				{
// 					model: Course,
// 					attributes: [['name', 'course_name'], 'holes', 'par']
// 				}]

// 		},{
// 			model: Player,
// 			attributes: ['first_name', 'last_name']
// 		}],
// 		where: {
// 			id: scorecard_id
// 		}
// 	}).then(scorecards => {
// 		res.json(scorecards);
// 	}).catch(function (err) {
// 		console.log(`Failed getting scorecard with id ${scorecard_id}: ${err}`);
// 		res.sendStatus(500);
// 		return;
// 	});
// });

// router.post('/', checkAuth, (req, res, next) => {

// 	Scorecard.create({
// 		date_time: req.body.date_time,
// 		created_by: req.body.Player.id

// 	}).then(scorecard => {
// 		req.body.Rounds.forEach(round => {
// 			Round.create({
// 				date: round.date,
// 				player_id: round.Player.id,
// 				course_id: round.Course.id,
// 				number_of_throws: round.throws,
// 				scorecard_id: scorecard.id
// 			});
// 		});
		
// 	}).catch(err => {
// 		console.log(`Failed posting scorecard: ${err}`);
// 		res.sendStatus(500);
// 		return;
// 	});
// });

// router.delete('/:scorecard_id', checkAuth, (req, res, next) => {
// 	const scorecard_id = req.params.scorecard_id;

// 	Round.destroy({
// 		where: {
// 			scorecard_id: scorecard_id
// 		}

// 	}).then(res => {
		
// 		Scorecard.destroy({
// 			where: {
// 				id: scorecard_id
// 			}
// 		}).catch(err => {
// 			console.log(`Failed to delete scorecard with id ${id}: ${err}`);
// 			res.sendStatus(500);
// 			return;
// 		});

// 	}).catch(err => {
// 		console.log(`Failed to delete rounds connected to scorecard with id ${id}: ${err}`);
// 		res.sendStatus(500);
// 		return;
// 	});

// 	res.status(200).json({
// 		message: `Deleted scorecard with id ${scorecard_id} successfully.`,
// 		id: scorecard_id
// 	});
// });

// module.exports = router;