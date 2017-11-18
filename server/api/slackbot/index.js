'use strict';

const slackbotRouter = require('express').Router();
const slackbotController = require('./controller');

slackbotRouter.route('/postTrade')
    .post((req, res) => {
        slackbotController.sendTradeMessage(req.body, (err, result) => {
            if(!err) {
                console.log(result);
                res.json({message: 'Trade uploaded to slack channel', response: result});
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });

module.exports = slackbotRouter;