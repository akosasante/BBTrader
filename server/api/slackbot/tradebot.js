"use strict";

//Bot
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const TradeBot = new RtmClient(bot_token);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
TradeBot.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
      if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
 
// // you need to wait for the client to fully connect before you can send messages
// TradeBot.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
// //   TradeBot.sendMessage("Hello!", channel);
//     console.log("CONNECTED TO SLACK");
// });
 
// TradeBot.start();

module.exports = TradeBot;
