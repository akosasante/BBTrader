'use strict';
const Trade = require('./trade');
const TradeEmails = require('./tradeEmail');
const Player = require('./player');
const emailController = require('../email/controller');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('lodash');
const inverseMembersMap = require('../../config/members').nameToId;

module.exports.getTrade = function(data, cb) {
    const tradeIds = _.values(data).map(id => mongoose.mongo.ObjectId(id));
    const populateOpts = [
        { path: 'players.rec', model: 'Player' },
        { path: 'prospects.rec', model: 'Player' },
        { path: 'picks.rec', model: 'Player' },
        { path: 'sender', model: 'Player' },
    ];
    Trade.find({
        '_id': { $in : tradeIds }
    }).then(async results => {
        try {
            const fullTrades = await Trade.populate(results, populateOpts);
            console.log(fullTrades);
            cb(null, fullTrades);
        } catch(error) {
            console.log(error);
            cb(error);
        }
    }).catch(err => {
        console.log(err);
        cb(err);
    });
};
module.exports.getUsername = function(userId) {
    return Player.findById(userId, {username: true})
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getEmail = function(userId) {
    console.log(userId);
    return Player.findById(userId)
        .then(result => {
            console.log('RESULT!: ', result);
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getUserId = function(playerId) {
    return Player.findById(playerId, {userId: true})
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};


module.exports.getRecipients = function(tradesArr) {
    const tradeIds = tradesArr.map(trade => mongoose.mongo.ObjectId(trade._id));

    return TradeEmails.findOne({trades: tradeIds}, {recipients: true})
        .then(async result => {
            try {
                const usernameList = await TradeEmails.populate(result, {path: 'recipients.recipient', model: 'Player'});
                return usernameList.recipients;
            } catch(error) {
                console.log(error);
                return null;
            }
        })
        .catch(err => {
            console.log(err);
            return null;
        });
};

//data = {tradeIds: [ObjectIds], recipient: String}
module.exports.updateConfirmation = function(data, cb) {
    const tradeIds = (data.trades).map(trade => mongoose.mongo.ObjectId(trade._id));
    const recipientId = inverseMembersMap[data.recip];

    TradeEmails.findOneAndUpdate({trades: tradeIds, 'recipients.recipient': recipientId}, {$set: {'recipients.$.confirmed': true}}, {'new': true}).then(async result => {
        console.log('\x1b[42m', 'RESULT: ', result);
        const allUpdated = result.recipients.every(elem => {
            return elem.confirmed;
        });

        if(allUpdated) {
            try {
                let email = await emailController.sendValidationEmail(result.sender, tradeIds, data.trades);
                console.log('\x1b[43m', 'VALIDATION EMAIL SENT');
            } catch(err) {
                console.log(err);
            }
        }
        cb(null, result);
    }).catch(err => {
        console.log(err);
        cb(err);
    });
};
