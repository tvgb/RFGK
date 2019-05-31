const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const Course = require('../../src/models/Course');


// Get all Courses
router.get('/', (req, res, next) =>  {

	Course.findAll()
	.then(courses => {
		res.json(courses);
	})
	.catch(err => {
		console.log(`Failed getting all courses: ${err}`);
		res.sendStatus(500);
		return;
	});
});

// Get course with id "course_id"
router.get('/:course_id', (req, res, next) =>  {
	const course_id = req.params.course_id;
	
	Course.findOne({
		where: {
			id: course_id
		}
	}).then(course => {
		res.json(course);
	}).catch(err => {
		console.log(`Failed getting course with id ${course_id}: ${err}`);
		res.sendStatus(500);
		return;
	})
=======
const pool = require('../database');
const config = require('../../config');


router.get('/', (req, res, next) =>  {
    const query = "SELECT * FROM Course";

    pool.query(query, (err, rows, fields) => {
        if (err) {
            console.log("Failed getting all courses: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
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
>>>>>>> 66a1b9fbb971d639c3daa2ce51b3bcd60c11573b
});

module.exports = router;