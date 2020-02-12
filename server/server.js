'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');

require('dotenv').config({path: './config/.env'});
global.Promise = require('bluebird');
const app = express();

//Database
const dbUrl = process.env.NODE_ENV === 'development' ? process.env.DB_DEV : process.env.DB_PROD;
mongoose.connect(dbUrl, {useMongoClient: true});

//Logging
if(process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
}

//Request body parsing
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

//CORS
app.use(cors());

//auth initialization and routes
require('./auth/passport')(passport);
app.use(passport.initialize());
require('./auth')(app, passport);

//API Routes
require('./api')(app);

// Errors
app.use((err, req, res, next) => {
    if(process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    } else {
        next(err);
    }
});

//Start Server
const server = app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Server Connected');
    console.log(`Running in ${process.env.NODE_ENV} mode on ${server.address().address}:${server.address().port}`);
    console.log(`Database @ ${dbUrl}`);
});

// module.exports = app;
