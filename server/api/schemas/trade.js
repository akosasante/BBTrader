'use strict';

// grab the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// module.exports allows us to pass this to other files when it is called
var tradeSchema = new Schema({
    players: [{
        player: String,
        rec: {type: Schema.Types.ObjectId, ref: 'Player'}
    }],
    prospects: [{
        prospect: String,
        rec: {type: Schema.Types.ObjectId, ref: 'Player'}
    }],
    picks: [{
        pick: String,
        rec: {type: Schema.Types.ObjectId, ref: 'Player'},
        round: { type: Number, min: 1, max: 25 },
        type: { type: String, enum: ['high', 'low', 'major']}
    }],
    sender: {type: Schema.Types.ObjectId, ref: 'Player'}
});


module.exports = mongoose.model('Trade', tradeSchema);
