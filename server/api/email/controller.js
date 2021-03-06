'use strict';

const nodemailer = require('nodemailer');
const sendinBlue = require('nodemailer-sendinblue-transport');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Trade = require('../schemas/trade');
const TradeEmail = require('../schemas/tradeEmail');
const EmailTemplate = require('email-templates');
const path = require('path');
const membersMap = require('../../config/members').idToName;
const modelController = require('../schemas/controller.js');
const moment = require('moment');

//TODO: Remove api key
const smtpOptions = {
    apiKey: process.env.EMAIL_KEY
};
const transporter = nodemailer.createTransport(sendinBlue(smtpOptions));
const domain = process.env.DOMAIN;
const fromEmail = 'tradebot@flexfoxfantasy.com';

module.exports.sendPasswordResetEmail = async function(savedUser) {
    const url = `${domain}/reset/${savedUser.resetPasswordToken}`;
    const email = new EmailTemplate({
        message: {
            from: 'tradebot@flexfoxfantasy.com',
            to: savedUser.email
        },
        transport: transporter,
        preview: false,
        send: true,
        juice: true,
        juiceResources: {
            preserveImportant: true,
            webResources: {
                relativeTo: path.resolve('emails')
            }
        },
        htmlToText: false
    });

    return email.send({
        template: 'forgot-password',
        locals: {
            sender: savedUser.name,
            url: url
        }
    });
};

module.exports.sendPasswordConfirmEmail = async function(savedUser) {
    const email = new EmailTemplate({
        message: {
            from: 'tradebot@flexfoxfantasy.com',
            to: savedUser.email
        },
        transport: transporter,
        preview: false,
        send: true,
        juice: true,
        juiceResources: {
            preserveImportant: true,
            webResources: {
                relativeTo: path.resolve('emails')
            }
        },
        htmlToText: false
    });

    return email.send({
        template: 'confirm-reset-password',
        locals: {
            sender: savedUser.name,
            email: savedUser.email
        }
    });
};

module.exports.sendDeclineEmail = async function(recipients, tradeData, tradeEmail, reason) {
    const declinedBy = membersMap[tradeEmail.declined.by];

    try {
        const recipEmails = await Promise.all(recipients.map(recip => modelController.getEmail(recip)));
        console.log('\x1b[41m', 'Declination Recip', recipEmails);
        const sendInfo = {
            from: fromEmail,
            to: recipEmails
        };

        const email = new EmailTemplate({
            message: sendInfo,
            transport: transporter,
            preview: false,
            send: true,
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.resolve('emails')
                }
            },
            htmlToText: false
        });
        return email.send({
            template: 'trade-decline',
            locals: {
                declinedBy: declinedBy,
                tradeData: tradeData,
                reason: reason
            }
        });
    } catch(emailError) {
        console.log(emailError);
        return null;
    }
};

module.exports.sendValidationEmail = async function(sender, tradeIds, tradeData) {
    const senderName = membersMap[sender];
    // let senderEmail;
    try {
        const senderEmail = await modelController.getEmail(sender);
        console.log('\x1b[41m', 'VALIDATION SENDER', senderEmail);
        tradeData = tradeData.map(trade => {
            trade.picks = trade.picks.reduce((obj, pick) => {
                obj[pick.type] = (obj[pick.type] || []).concat([pick]);
                return obj;
            }, {});
            return trade;
        });

        console.log('\x1b[45m', tradeData);
        let url = `${domain}/send/${sender}?`;
        tradeIds.forEach((id, indx) => {
            url += `${indx}=${id}&`;
        });
        const sendInfo = {
            from: fromEmail,
            to: senderEmail,
        };
        const email = new EmailTemplate({
            message: sendInfo,
            transport: transporter,
            preview: false,
            send: true,
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.resolve('emails')
                }
            },
            htmlToText: false
        });
        return email.send({
            template: 'trade-send',
            locals: {
                sender: senderName,
                tradeData: tradeData,
                url: url
            }
        });
    } catch(emailError) {
        console.log(emailError);
        return null;
    }
};

function sendTradeRequestMail(sender, recipient, tradeData, tradeIds, expiryDate) {
    const namedTradeData = tradeData.map(trade => {
        console.log('TRADEREQUEST: ', recipient);
        const senderName = membersMap[trade.sender];
        const players = trade.players.map(player => {
            const newPlayer = { _id: player._id, player: player.player, rec: membersMap[player.rec] };
            return newPlayer;
        });
        const prospects = trade.prospects.map(prospect => {
            const newProspect = { _id: prospect._id, prospect: prospect.prospect, rec: membersMap[prospect.rec] };
            return newProspect;
        });
        const picks = trade.picks.reduce((obj, pick) => {
            const newPick = { _id: pick._id, round: pick.round, pick: pick.pick, type: pick.type, rec: membersMap[pick.rec] };
            obj[pick.type] = (obj[pick.type] || []).concat([newPick]);
            return obj;
        }, {});
        const newTrade = {sender: senderName, players: players, prospects: prospects, picks: picks};
        // console.log('\x1b[42m', newTrade);
        return newTrade;
    });

    let url = `${domain}/confirm/${recipient.name}?`;
    tradeIds.forEach((id, indx) => {
        url += `${indx}=${id}&`;
    });
    console.log(url);
    const sendInfo = {
        from: 'tradebot@flexfoxfantasy.com',
        to: recipient.email,
    };
    const email = new EmailTemplate({
        message: sendInfo,
        transport: transporter,
        preview: false,
        send: true,
        juice: true,
        juiceResources: {
            preserveImportant: true,
            webResources: {
                relativeTo: path.resolve('emails')
            }
        },
        htmlToText: false
    });
    return email.send({
        template: 'trade-submit',
        locals: {
            sender: sender.name,
            recipient: recipient.name,
            tradeData: namedTradeData,
            url: url,
            expiry: moment(expiryDate).format('MMM DD YYYY, hh:mm A')
        }
    });
}

//Data will come as [Trade, recepient list];
module.exports.sendTradeRequest = function(data, cb) {
    const tradeData = data[0];
    const sender = data[1].shift();
    let recipients = data[1];
    recipients = recipients.reduce((arr, recip) => {
        arr.push({ recipient: recip._id.$oid, confirmed: false });
        return arr;
    }, []);
    let mailResult = [];

    Trade.create(tradeData, async (err, tradeResult) => {
        if(err) {
            cb(err);
        } else {
            console.log('\x1b[35m', 'NOERROR', tradeResult);
            const tradeIds = tradeResult.reduce((arr, trade) => {
                arr.push(trade._id);
                return arr;
            }, []);
            console.log('\x1b[34m', 'TRADEIDS', tradeIds);

            const expiryDate = moment().add(1, 'd');

            let promisedMail = data[1].map(recep => sendTradeRequestMail(sender, recep, tradeResult, tradeIds, expiryDate));

            try {
                mailResult = await Promise.all(promisedMail);
                TradeEmail.create({ emailId: mailResult[0].messageId, sender: sender._id.$oid, recipients: recipients, trades: tradeIds, expiry: expiryDate }).then(emailSaved => {
                    console.log('\x1b[35m', 'SAVED', emailSaved);
                    cb(null, emailSaved);
                }).catch(emailError => {
                    console.log(emailError);
                    cb(emailError);
                });
            } catch(err) {
                console.log('ERRROR', err);
                cb(err.message);
            }
        }
    });
};

// module.exports.sendTradeConfirmation = function(data, cb) {
//         let queryString = "?";
//         for(let x in data) {
//             queryString += `${x}=${data[x]}&`;
//         }
//         console.log(queryString);
//     mailOptions.html = `<div><p>${data.userTwo} accepted your trade, ${data.userOne}! They will send over:
// <p>    Players: ${data.receivePlayers};
// <p>    Prospects: ${data.receiveProspects};
// <p>    Picks: ${data.receivePicks};
// <p>In return, you agreed to send them:
// <p>    Players: ${data.sentPlayers};
// <p>    Prospects: ${data.sentProspects}
// <p>    Picks: ${data.sentPicks};
// <p>If all is good, please go to the following link to submit this trade to the commissioners.
// <a href="${domain}/final${queryString}">Validation link</a>
// ***Just for testing***</div>`;
//     transporter.sendMail(mailOptions, (err, result) => {
//       if(!err) {
//           console.log("Sent");
//           cb(null, result);
//       } else {
//           console.log("ERROR!");
//           cb(err);
//       }
//     });
// }
