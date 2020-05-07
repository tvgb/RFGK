const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');

// GET all courses.
router.get('/', async (req, res) =>  {

    try {
        const courses = await Course.find();
        
        return res.status(200).json(courses);

    } catch (error) {
        console.log(error);

        return res.status(500);
    }
});

module.exports = router;