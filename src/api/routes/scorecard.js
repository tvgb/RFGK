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
        if (req.query.year) {
            const year = parseInt(req.query.year, 10);
            const startDate = moment(`${year}-01-01`, moment.DATE);
            const endDate = moment(`${year + 1}-01-01`, moment.DATE).add(-1, 'days');

            query.where('datetime').gte(startDate).lte(endDate);
        }
        
        // Get round by course if optional query param course is set
        if (req.query.course) {
            const course = req.query.course;
            
            query.where({
                'course': course
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

        let roundIds = [];

        for (const round of req.body.rounds) {
            const newRound = new Round({
                datetime: round.date,
                player: round.player.id,
                course: round.course.id,
                numberOfThrows: round.throws
            });
    
            const savedNewRound = await newRound.save();
    
            roundIds.push(savedNewRound._id);
        }
    
        const newScorecard = new Scorecard({
            datetime: req.body.datetime,
            createdBy: req.body.player.id,
            course: req.body.course.id,
            rounds: roundIds
        });

        await newScorecard.save();

        return res.status(200);

    } catch (error) {
        console.log(error);

        return res.status(500);
    }
});

module.exports = router;