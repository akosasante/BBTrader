'use strict';

const slackbotRouter = require('express').Router();
const slackbotController = require('./controller');
const sheetApi = require('../tradesheet/ApiClient');
const {sendTradeMessage} = require('./new_slackbot');

slackbotRouter.route('/postTrade')
    .post((req, res) => {
        sendTradeMessage(req.body)
            .then(slackRes => console.log(`RESULT FROM NEW SLACKBOT: ${JSON.stringify(slackRes)}`))
            .catch(slackErr => console.error(`ERROR FROM NEW SLACKBOT: ${JSON.stringify(slackErr)}`));

        slackbotController.sendTradeMessage(req.body, (err, result) => {
            if (!err) {
                const sheetClient = new sheetApi();
                sheetClient.getSheetsClient().then(() => {
                    const tradesByRecipient = getTradeDataForSheets(req.body.trades);
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
                    sheetClient.appendToSheet(data, function (error, response) {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        console.log(JSON.stringify(response.data, null, 2));
                        res.json({message: 'Trade uploaded to slack channel', response: result});
                    });
                });
            } else {
                res.status(500).send({message: 'Something went wrong, please contact admin', error: err});
            }
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
