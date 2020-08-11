'use strict';

const slackbotRouter = require('express').Router();
// const slackbotController = require('./controller');
const sheetApi = require('../tradesheet/ApiClient');
const {sendTradeMessage} = require('./new_slackbot');
const Trade = require('../schemas/trade');

slackbotRouter.route('/postTrade')
    .post((req, res) => {
        sendTradeMessage(req.body)
            .then(slackRes => {
                console.log(`RESULT FROM NEW SLACKBOT: ${JSON.stringify(slackRes)}`);
                return req.body;
                // res.json({message: 'Trade uploaded to slack channel', response: slackRes});
            })
            .then(async body => {
                const sheetClient = new sheetApi();
                await sheetClient.getSheetsClient();
                const tradesByRecipient = getTradeDataForSheets(body.trades);
                const recipients = Object.keys(tradesByRecipient);
                const trades = recipients.map(recip => [
                    recip,
                    tradesByRecipient[recip].players.map(pl => `${pl.player} FROM ${pl.sender}`).join(',\n'),
                    tradesByRecipient[recip].prospects.map(pr => `${pr.prospect} FROM ${pr.sender}`).join(',\n'),
                    tradesByRecipient[recip].picks.map(pi => `${pi.type} - ${pi.round} - ${pi.pick} FROM ${pi.sender}`).join(',\n')
                ]);
                const data = trades.reduce((arr, trade, index) => {
                    if (index === 0) {
                        arr.push((new Date()).toISOString().substring(0, 10));
                        arr = arr.concat(trade);
                    } else {
                        arr = arr.concat('', trade);
                    }
                    return arr;
                }, []);
                sheetClient.appendToSheet(data, function (sheetsErr, response) {
                    if (sheetsErr) {
                        console.error(sheetsErr);
                        res.status(500).send({message: 'Something went wrong, please contact admin', error: sheetsErr});
                    }
                    console.log(JSON.stringify(response.data, null, 2));
                    res.json({message: 'Trade uploaded to slack channel and sheets', response: 'success'});
                });
            }).catch(slackErr => {
                console.error(`ERROR FROM NEW SLACKBOT: ${JSON.stringify(slackErr)}`);
                res.status(500).send({message: 'Something went wrong, please contact admin', error: slackErr});
            });
    });

slackbotRouter.route('/postSheetsOnly')
    .post(async (req, res) => {
        const sheetClient = new sheetApi();
        await sheetClient.getSheetsClient();
        const tradeObjs = req.body.trades.map(id => Trade.findById(id).exec());
        const tradesByRecipient = getTradeDataForSheets(tradeObjs);
        const recipients = Object.keys(tradesByRecipient);
        const trades = recipients.map(recip => [
            recip,
            tradesByRecipient[recip].players.map(pl => `${pl.player} FROM ${pl.sender}`).join(',\n'),
            tradesByRecipient[recip].prospects.map(pr => `${pr.prospect} FROM ${pr.sender}`).join(',\n'),
            tradesByRecipient[recip].picks.map(pi => `${pi.type} - ${pi.round} - ${pi.pick} FROM ${pi.sender}`).join(',\n')
        ]);
        const data = trades.reduce((arr, trade, index) => {
            if (index === 0) {
                arr.push((new Date()).toISOString().substring(0, 10));
                arr = arr.concat(trade);
            } else {
                arr = arr.concat('', trade);
            }
            return arr;
        }, []);
        sheetClient.appendToSheet(data, function (sheetsErr, response) {
            if (sheetsErr) {
                console.error(sheetsErr);
                res.status(500).send({message: 'Something went wrong, please contact admin', error: sheetsErr});
            }
            console.log(JSON.stringify(response.data, null, 2));
            res.json({message: 'Trade uploaded to trade inedx sheet only', response: 'success'});
        });
    });

function getTradeDataForSheets(trades) {
    let tradesByRecipient = {};
    trades.forEach(trade => {
        tradesByRecipient[trade.sender.name] = {players: [], prospects: [], picks: []};
    });
    trades.forEach(trade => {
        trade.players.forEach(player => {
            tradesByRecipient[player.rec.name].players.push({player: player.player, sender: trade.sender.name});
        });
        trade.prospects.forEach(prospect => {
            tradesByRecipient[prospect.rec.name].prospects.push({
                prospect: prospect.prospect,
                sender: trade.sender.name
            });
        });
        trade.picks.forEach(pick => {
            tradesByRecipient[pick.rec.name].picks.push({
                type: pick.type,
                round: pick.round,
                pick: pick.pick,
                sender: trade.sender.name
            });
        });
    });
    return tradesByRecipient;
}

module.exports = slackbotRouter;
