'use strict';

const SlackBot = require('slackbots');
const announcementsChannel = process.env.FF_TRADE_ANNOUNCEMENT_CHANNEL_ID;

module.exports.sendMessage = function(text) {
    const TradeBotTwo = new SlackBot({
        token: process.env.SLACK_BOT_TOKEN,
        name: 'tradebot'
    });
    TradeBotTwo.on('start', function() {
        const params = {
            icon_emoji: ':baseball:'
        };
        if(process.env.NODE_ENV === 'development') {
            return TradeBotTwo.openIm(process.env.PRIVATE_TEST_IM_CHANNEL_ID)
                .then(response => {
                    const channelId = response.channel.id;
                    return TradeBotTwo.postMessage(channelId, text, params)
                        .then(console.log)
                        .error(console.error);
                })
        } else {
            return TradeBotTwo.postMessage(announcementsChannel, text, params);
        }
    });
};
