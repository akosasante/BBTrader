'use strict';
const TradeBot = require('./slackbot');
// const channel = 'G7TEGSZTL';
// const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const modelController = require('../schemas/controller.js');

// const IncomingWebhook = require("@slack/client").IncomingWebhook;

//TODO: hide the url later
// const url = "https://hooks.slack.com/services/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";
// const webhook = new IncomingWebhook(url);


module.exports.sendTradeMessage = async function(data, cb) {
    // TradeBot.connect('wss://mpmulti-n3vk.lb.slack-msgs.com/websocket/Httr_bw-1eSCoS2hW_BuwfALb2-g89ViefJrIDCoktEtcs7ruw1FGVkbYuO-1tqNld_Euv8Mvk72OBImReBKu0sUa7aw44kV6X6EvBBVdcBuJgr3GZg1-aT3aDGLZAOIizd4lwQ3pq84aDW6FY-_GgMBRgC6n5XhwWHjDPwOVSo=');
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
    // console.log('\x1b[45m', 'OKOKOKO', data.trades);
    
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
    recipients.forEach(recip => {
        const playersReceived = data.trades.map(trade => [trade.sender, trade.players.filter(player => player.rec.userId === recip)])
            .reduce((arr, curr) => {
                let obj = {};
                obj.sender = curr[0];
                if(curr[1].length > 0) {
                    obj.players = curr[1].map(player => player.player);
                }
                arr.push(obj);
                return arr;
            }, [])
            .filter(tradeObj => tradeObj.players)
            .reduce((str, curr) => {
                return str += `${curr.players.join(', ')} _(from ${curr.sender.name})_;  `;
            }, '');
        const playersText = playersReceived || 'None';

        const prospectsReceived = data.trades.map(trade => [trade.sender, trade.prospects.filter(player => player.rec.userId === recip)])
            .reduce((arr, curr) => {
                let obj = {};
                obj.sender = curr[0];
                if(curr[1].length > 0) {
                    obj.prospects = curr[1].map(prospect => prospect.prospect);
                }
                arr.push(obj);
                return arr;
            }, [])
            .filter(tradeObj => tradeObj.prospects)
            .reduce((str, curr) => {
                return str += `${curr.prospects.join(', ')} _(from ${curr.sender.name})_;  `;
            }, '');
        const prospectsText = prospectsReceived || 'None';

        const picksReceived = data.trades.map(trade => [trade.sender, trade.picks.filter(pick => pick.rec.userId === recip)])
            .reduce((arr, curr) => {
                let obj = {};
                obj.sender = curr[0];
                if(curr[1].length > 0) {
                    obj.picks = curr[1].map(picks => ({pick: picks.pick, round: picks.round}));
                }
                arr.push(obj);
                return arr;
            }, [])
            .filter(tradeObj => tradeObj.picks)
            .reduce((str, curr) => {
                return str += `${curr.picks.map(pick => `${pick.pick}'s _round ${pick.round}_ pick`).join(', ')} _(from ${curr.sender.name})_;  `;
            }, '');
        const picksText = picksReceived || 'None';

        text += '\n';
        text += `*To:* <@${recip}>:
        *Players:* 
            ${playersText}
        *Prospects:* 
            ${prospectsText}
        *Picks:* 
            ${picksText}`;
    });

    // console.log('\x1b[41m', 'T', text);
    try {
        TradeBot.sendMessage(text);
        cb(null, 'this is a hack');
    } catch(err) {
        console.error(err);
        cb(err);
    }
    
    
    //figure out if tradebot has promise or what

};

