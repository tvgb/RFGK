const express = require('express');
const router = express.Router();
const pool = require('../database');
const config = require('../../config');
const Course = require('../../src/models/Course');



router.get('/', (req, res, next) =>  {

	Course.findAll()
	.then(courses => {
		res.json(courses);
	})
	.catch(err => {
		console.log("Failed getting all courses: " + err);
		res.sendStatus(500);
		return;
	});


    // const query = "SELECT * FROM Course";

    // pool.query(query, (err, rows, fields) => {
    //     if (err) {
    //         console.log("Failed getting all courses: " + err);
    //         res.sendStatus(500);
    //         return;
    //     }

    //     res.json(rows);
    // });
});

router.get('/:course_id', (req, res, next) =>  {
    const course_id = req.params.course_id;
    const query = "SELECT * FROM Course WHERE id = ?";

    pool.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting a course: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

module.exports = router;