'use strict';

const express = require('express');
const path = require('path');

const emailApi = require('./email');
const slackbotApi = require('./slackbot');
const modelApi = require('./schemas/index.js');

function initApp(app) {
    // Static files for vue client =============================================
    // app.use("/js", express.static(__dirname + "../../client/js"));
    // app.use("/css", express.static(__dirname + "../../client/css"));
    app.use(express.static(path.join(__dirname, '../../client')));
    
    // API controller routes ===================================================
    app.use('/tradebot', slackbotApi);
    app.use('/mailer', emailApi);
    app.use('/models', modelApi);
    
    // Front-end routes ========================================================
    // app.get("/confirm", (req, res) => {
    //     res.sendFile("index.html", {root: path.join(__dirname, "../../client/confirmation")});
    // });
    // app.get("/final", (req, res) => {
    //     res.sendFile("index.html", {root: path.join(__dirname, "../../client/finalValidation")});
    // });
    app.get('/preview/:id', (req, res) => {
        res.sendFile(`${req.params.id}.html`, {root: path.join(__dirname, '../emails/tmp')});
    });
    app.get('/*', (req, res) => {
        res.sendFile('index.html', {root: path.join(__dirname, '../../client')});
    });
}

module.exports = initApp;