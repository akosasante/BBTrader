'use strict';

const modelRouter = require('express').Router();
const modelController = require('./controller');

modelRouter.route('/getTrade')
    .post((req, res) => {
        modelController.getTrade(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Retrieved trades', response: result});
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });
modelRouter.route('/updateConfirmation')
    .post((req, res) => {
        modelController.updateConfirmation(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Updated trade email object', response: result});
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });
modelRouter.route('/declineTrade')
    .post((req, res) => {
        modelController.declineTrade(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Successfully declined trade', response: result});
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });
modelRouter.route('/checkTradeValid')
    .post((req, res) => {
        modelController.checkTradeValid(req.body, (err, result) => {
            if(!err) {
                res.json({message: 'Trade still valid', response: result});
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
        });
    });

module.exports = modelRouter;