// Get environment variables
require('dotenv').config();

//package imports
const express = require('express');
const cors = require('cors');
//const morgan = require('morgan');
const mongoose = require('mongoose');

//route imports
const roundRoutes = require('./api/routes/rounds');
const playerRoutes = require('./api/routes/players');
const courseRoutes = require('./api/routes/course');
const scorecardRoutes = require('./api/routes/scorecard');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(morgan('comine'));
app.use(cors());


//app.use('/api/rounds', roundRoutes);
app.use('/api/players', playerRoutes);
//app.use('/api/courses', courseRoutes);
//app.use('/api/scorecard', scorecardRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        message: 'Hello world, now CI and CD works!'
    });
});

app.use((req, res, next) => {
   const error = new Error('Not found');
   error.status = 404;
   next(error);
});

app.use((error, req, res) => {
   res.status(error.status || 500);
   res.json({
       error: {
           message: error.message
       }
   });
});

// Connect mongoose to MongoDB database
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true,  useUnifiedTopology: true  }, () => 
    console.log('Connected to DB!')
);


module.exports = app;
