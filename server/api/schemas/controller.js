'use strict';
const Trade = require('./trade');
const TradeEmails = require('./tradeEmail');
const Player = require('./player');
const emailController = require('../email/controller');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('lodash');
const inverseMembersMap = require('../../config/members').nameToId;
const moment = require('moment');

module.exports.getTrade = function (data, cb) {
    const tradeIds = _.values(data).map(id => mongoose.mongo.ObjectId(id));
    const populateOpts = [
        {path: 'players.rec', model: 'Player'},
        {path: 'prospects.rec', model: 'Player'},
        {path: 'picks.rec', model: 'Player'},
        {path: 'sender', model: 'Player'},
    ];
    console.log(tradeIds);
    Trade.find({
        '_id': {$in: tradeIds}
    }).then(async results => {
        try {
            const fullTrades = await Trade.populate(results, populateOpts);
            console.log(fullTrades);
            cb(null, fullTrades);
        } catch (error) {
            console.log(error);
            cb(error);
        }
    }).catch(err => {
        console.log(err);
        cb(err);
    });
};
module.exports.getUsername = function (userId) {
    return Player.findById(userId, {username: true})
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getEmail = function (userId) {
    console.log(userId);
    return Player.findById(userId)
        .then(result => {
            // console.log('RESULT!: ', result.email);
            return result.email;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getUserId = function (playerId) {
    return Player.findById(playerId, {userId: true})
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getNameOfUser = function (playerId) {
    return Player.findById(playerId, {name: true})
        .then(result => {
            return result;
        })
        .catch(error => {
            console.log(error);
            return null;
        });
};

module.exports.getRecipients = function (tradesArr) {
    const tradeIds = tradesArr.map(trade => mongoose.mongo.ObjectId(trade._id));

    return TradeEmails.findOne({trades: tradeIds}, {recipients: true})
        .then(async result => {
            try {
                const usernameList = await TradeEmails.populate(result, {
                    path: 'recipients.recipient',
                    model: 'Player'
                });
                return usernameList.recipients;
            } catch (error) {
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
module.exports.updateConfirmation = function (data, cb) {
    const tradeIds = (data.trades).map(trade => mongoose.mongo.ObjectId(trade._id));
    const recipientId = inverseMembersMap[data.recip];

    TradeEmails.findOneAndUpdate({
        trades: tradeIds,
        'recipients.recipient': recipientId
    }, {$set: {'recipients.$.confirmed': true}}, {'new': true}).then(async result => {
        console.log('\x1b[42m', 'RESULT: ', result);
        const allUpdated = result.recipients.every(elem => {
            return elem.confirmed;
        });

        if (allUpdated) {
            try {
                let email = await emailController.sendValidationEmail(result.sender, tradeIds, data.trades);
                console.log('\x1b[43m', 'VALIDATION EMAIL SENT', email);
            } catch (err) {
                console.log(err);
            }
        }
        cb(null, result);
    }).catch(err => {
        console.log(err);
        cb(err);
    });
};

module.exports.checkTradeValid = function (data, cb) {
    const tradeIds = (data.trades).map(trade => mongoose.mongo.ObjectId(trade._id));
    const recipientId = inverseMembersMap[data.recip];

    TradeEmails.findOne({trades: tradeIds, 'recipients.recipient': recipientId})
        .then(result => {
            console.log('x1b[44m', 'Expiry Result: ', result);
            if (moment() > result.expiry) {
                console.log('EXPIRED TRADE');
                cb({reason: 'Expired', err: result.expiry});
            } else if (result.declined.status) {
                console.log('DECLINED TRADE');
                cb({reason: 'Declined', err: result.declined});
            } else {
                cb(null, result);
            }
        });
};

module.exports.declineTrade = function (data, cb) {
    const tradeIds = (data.trades).map(trade => mongoose.mongo.ObjectId(trade._id));
    const recipientId = inverseMembersMap[data.recip];

    TradeEmails.findOneAndUpdate({
        trades: tradeIds,
        'recipients.recipient': recipientId
    }, {$set: {'declined.status': true, 'declined.by': recipientId}}, {'new': true}).then(async result => {
        console.log('\x1b[42m', 'DECLINE RESULT: ', result);
        try {
            let recipients = result.recipients.map(recip => recip.recipient);
            recipients.push(result.sender);
            console.log('RECIPS', recipients);
            let email = await emailController.sendDeclineEmail(recipients, data.trades, result, data.reason);
            console.log('\x1b[43m', 'Declination EMAIL SENT', email);
        } catch (err) {
            console.log(err);
            throw err;
        }
        cb(null, result);
    }).catch(err => {
        console.log(err);
        cb(err);
    });
};

module.exports.getAllTrades = function (cb) {
    const rootPopulateOpts = {
        path: 'sender recipients.recipient declined.by',
    };
    const tradePopuateOpts = {
        path: 'trades',
        populate: { path: 'players.rec prospects.rec picks.rec sender'}
    };
    TradeEmails
        .find()
        .populate(rootPopulateOpts)
        .populate(tradePopuateOpts)
        .then(async results => {
            try {
                console.log(results);
                cb(null, results);
            } catch (error) {
                console.log(error);
                cb(error);
            }
        }).catch(err => {
            console.log(err);
            cb(err);
        });
};
