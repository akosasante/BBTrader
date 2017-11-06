'use strict';

// grab the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// module.exports allows us to pass this to other files when it is called
var playerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    userId: {type: String, required: true}
});

module.exports = mongoose.model('Player', playerSchema);