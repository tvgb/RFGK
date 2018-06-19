const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../../config');


router.get('/', (req, res, next) =>  {
    const query = "SELECT * FROM Course";
    const connection = getConnection();

    connection.query(query, (err, rows, fields) => {
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
    const connection = getConnection();

    connection.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting a course: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});


function getConnection() {
    const connection = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

    return connection;
}

module.exports = router;