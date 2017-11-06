'use strict';
const TradeBot = require('./tradebot');
const channel = 'G7TEGSZTL';
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const modelController = require('../schemas/controller.js');
const fs = require('fs');

// const IncomingWebhook = require("@slack/client").IncomingWebhook;

//TODO: hide the url later
// const url = "https://hooks.slack.com/services/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";
// const webhook = new IncomingWebhook(url);


module.exports.sendTradeMessage = async function(data, cb) {
    // console.log("TRADING");
    let recipients = [];
    // console.log('\x1b[45m', 'HEEEERE', data.trades);

    try {
        let tradeRec = await modelController.getRecipients(data.trades);
        let sender = await modelController.getUserId(data.sender);
        recipients.push(sender.userId);
        tradeRec.forEach(recip => {
            recipients.push(recip.recipient.userId);
        });
    } catch(err) {
        console.log('ERROR', err);
        cb(err);
    }
    console.log('\x1b[45m', 'OKOKOKO', recipients);
    
    // console.log("H", recipients);
    let text = '*A trade has been made!* \n';
    text += '*Participants:* ';
    recipients.forEach((recip, idx) => {
        if(idx === 0) {
            text += `<@${recip}>`;
        } else {
            text += ` and <@${recip}>`;
        }
    });
    text += '\n';
    data.trades.forEach(trade => {
        let playersText, prospectsText, picksText;
        if(trade.players.length > 0) {
            playersText = `${trade.players.map(player => player.player)} _to_ ${trade.players.map(player => player.rec.name)}`;
        } else {
            playersText = 'None';
        }
        if(trade.prospects.length > 0) {
            prospectsText = `${trade.prospects.map(prospect => prospect.prospect)} _to_ ${trade.prospects.map(prospect => prospect.rec.name)}`;
        } else {
            prospectsText = 'None';
        }
        if(trade.picks.length > 0) {
            picksText = `_Round:_ ${trade.picks.map(pick => pick.round)}, ${trade.picks.map(pick => pick.pick)}'s pick  _to_ ${trade.picks.map(pick => pick.rec.name)}`;
        } else {
            picksText = 'None';
        }
        text += '\n';
        text += `*From:* ${trade.sender.name}:
        *Players:* ${playersText}
        *Prospects:* ${prospectsText}
        *Picks:* ${picksText}`;
    });
    console.log('\x1b[45m', 'T', text);
    TradeBot.start();
    TradeBot.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
        console.log('CONNECTED TO SLACK');
        TradeBot.sendMessage(text, channel).then(response => {
            console.log(response);
            cb(null, 'GOOD');
        }).catch(messageError => {
            const commonError = 'message not sent due to connection trouble';
            if(messageError.message === commonError) {
                console.log('\x1b[15m','ERROR', messageError.name);
                cb('Try');
            } else {
                cb(messageError);
            }           
            
        });
    });
    
    
    //figure out if tradebot has promise or what

};

