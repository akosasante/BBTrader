'use strict';

const emailRouter = require('express').Router();
const emailController = require('./controller');

emailRouter.route('/tradeRequest')
    .post((req, res) => {
        emailController.sendTradeRequest(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Trade emailed to user', response: result});
            } else {
                res.status(500).json({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });
emailRouter.route('/tradeConfirmation')
    .post((req, res) => {
        emailController.sendTradeConfirmation(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Trade emailed to user', response: result});
            } else {
                res.status(500).json({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });


module.exports = emailRouter;