const express = require('express');
const router = express.Router();
const Round = require('../../models/Round');
const Scorecard = require('../../models/Scorecard');
const checkAuth = require('../middleware/check-auth');


// GET all existing scorecards.
router.get('/', async (req, res) =>  {

    try {
        const scorecards = await Scorecard.find()
        .populate({
            path: 'createdBy'
        })
        .populate({
            path: 'rounds',
            populate:
                [{
                    path: 'player'
                },{
                    path: 'course'
                }]
        });
        
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