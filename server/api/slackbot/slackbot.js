'use strict';

const SlackBot = require('slackbots');
const announcementsChannel = 'C0RV5M79C'

module.exports.sendMessage = function(text) {
    const TradeBotTwo = new SlackBot({
        token: process.env.SLACK_BOT_TOKEN,
        name: 'tradebot'
    });
    TradeBotTwo.on('start', function() {
        const params = {
            icon_emoji: ':baseball:'
        };
        console.log(announcementsChannel);
        return TradeBotTwo.postMessage(announcementsChannel, text, params);
    });
};
