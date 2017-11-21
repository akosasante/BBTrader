'use strict';

// grab the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

// module.exports allows us to pass this to other files when it is called
var tradeEmailSchema = new Schema({
    emailId: String,
    sender: {type: Schema.Types.ObjectId, ref: 'Player', required: true},
    recipients: [{
        recipient: {type: Schema.Types.ObjectId, ref: 'Player', required: true},
        confirmed: {type: Boolean, default: false}
    }],
    trades: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Trade'
    }],
    declined: {
        status: {type: Boolean, default: false},
        by: {type: Schema.Types.ObjectId, ref: 'Player'}
    },
    expiry: {type: Date, default: moment().add(1, 'd') }
});

module.exports = mongoose.model('TradeEmail', tradeEmailSchema);