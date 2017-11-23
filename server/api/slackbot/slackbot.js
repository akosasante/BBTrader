'use strict';

const SlackBot = require('slackbots');

module.exports.sendMessage = function(text) {
    const TradeBotTwo = new SlackBot({
        token: process.env.SLACK_BOT_TOKEN,
        name: 'tradebot'
    });
    TradeBotTwo.on('start', function() {
        const params = {
            icon_emoji: ':baseball:'
        };
        console.log('connected');
        return TradeBotTwo.postMessage('G7TEGSZTL', text, params);
    });
};