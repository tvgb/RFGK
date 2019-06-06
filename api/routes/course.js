const express = require('express');
const router = express.Router();
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
});

module.exports = router;