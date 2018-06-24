const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const checkAuth = require('../middleware/check-auth');




router.get('/', (req, res, next) =>  {
    const query = 'SELECT * FROM Player;';
    const connection = getConnection();
    connection.query(query, (err, rows, fields) => {
        if (err) {
            console.log("Failed getting all players: " + err)
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});


router.get('/:id', (req, res, next) => {
    const player_id = req.params.id;
    const query = 'SELECT * FROM Player WHERE id = ?;';
    const connection = getConnection();

    connection.query(query, [player_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed getting player by id: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

router.get('/leaderboard/avg/:course_id', (req, res, next) => {
    const course_id = req.params.course_id;
    const query = 'SELECT Player.first_name, Player.last_name, Course.name, Course.par, AVG(Round.number_of_throws) AS avg\n' +
        'FROM Round\n' +
        'INNER JOIN Course ON Round.course_id = Course.id\n' +
        'INNER JOIN Player ON Round.player_id = Player.id\n' +
        'WHERE Round.course_id = 1\n' +
        'GROUP BY player_id\n' +
        'ORDER BY avg;';
    const connection = getConnection();

    connection.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed to get leaderbord: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});

router.get('/leaderboard/best/:course_id', (req, res, next) => {
    const course_id = req.params.course_id;
    const query = "SELECT Player.first_name, Player.last_name, Course.name, Course.par,\n" +
        "  DATE_FORMAT(MAX(Round.date), '%d-%m-%Y') AS date, MIN(Round.number_of_throws) AS throws\n" +
        "FROM Round\n" +
        "  INNER JOIN Course ON Round.course_id = Course.id\n" +
        "  INNER JOIN Player ON Round.player_id = Player.id\n" +
        "WHERE Round.course_id = 1\n" +
        "GROUP BY\n" +
        "  Round.player_id\n" +
        "ORDER BY throws;";
    const connection = getConnection();

    connection.query(query, [course_id], (err, rows, fields) => {
        if (err) {
            console.log("Failed to get leaderbord: " + err);
            res.sendStatus(500);
            return;
        }

        res.json(rows);
    });
});


router.post('/signup', (req, res, next) => {
   if (process.env.SECRET_CODE === req.body.secret_code) {

       const connection = getConnection();
       const query = "SELECT * FROM Player WHERE email = ?;";
       connection.query(query, [req.body.email], (err, rows, fields) => {
           if (err) {
               return res.status(500).json({
                   message: 'Internal server error'
               })
           }

           if (rows.length > 0) {
               return res.status(401).json({
                   message: 'Auth failed'
               })
           } else {
               bcrypt.hash(req.body.password, 10, (error, hash) => {
                   if (error) {
                       return res.status(500).json({
                           error: error
                       })
                   } else {
                       const user = {
                           first_name: req.body.first_name,
                           last_name: req.body.last_name,
                           email: req.body.email,
                           password: hash,
                           birthday: req.body.birthday
                       };

                       const connection = getConnection();
                       const query = "INSERT INTO Player(first_name, last_name, email, password, birthday) VALUES (?, ?, ?, ?, ?);";
                       connection.query(query, [user.first_name, user.last_name, user.email, user.password, user.birthday], (error2, rows2, fields) => {
                           if (error2) {
                               console.log("Failed to create new user: " + error2);
                               res.sendStatus(500);
                               return;
                           }

                           return res.status(200).json({
                               message: 'User succesfully created'
                           })
                       });
                   }
               });
           }
       });

   } else {
       return res.status(401).json({
           message: 'wrong secret code'
       })
   }
});

router.post('/login', (req, res, next) => {
   const connection = getConnection();
   const query = "SELECT id, password FROM Player WHERE email = ?;";
   connection.query(query, [req.body.email], (err, rows, fields) => {
       if (err) {
           console.log("Failed to get id and password from user " + err);
           res.sendStatus(500);
           return;
       }

       if (rows.length < 1) {
           return res.status(200).json({
               message: "Auth failed"
           })
       } else {
           bcrypt.compare(req.body.password, rows[0].password, (err, result) => {
               if (err) {
                   return res.status(401).json({
                       message: 'Auth failed'
                   });
               }

               if (result) {
                   const token = jwt.sign({
                       email: req.body.email,
                       id: rows[0].id
                   },
                   process.env.JWT_KEY,
                   {
                       expiresIn: "1h"
                   }
                   );
                   return res.status(200).json({
                       message: "Auth successful",
                       token: token
                   })
               }

               return res.status(200).json({
                   message: "Auth failed"
               })
           });
       }
   });
});


router.put('/newpassword', checkAuth, (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (error, hash) => {
        if (error) {
            return res.status(500).json({
                error: error
            })
        } else {

            console.log();
            const connection = getConnection();
            const query = "UPDATE Player\n" +
                          "SET password = ?\n" +
                          "WHERE id = ?;";
            connection.query(query, [hash, req.userData.id], (err, row, fields) => {
                if (err) {
                    console.log("Failed to create new user: " + err);
                    res.sendStatus(500);
                    return;
                }

                return res.status(200).json({
                    message: 'Password succesfully updated'
                })
            });
        }
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