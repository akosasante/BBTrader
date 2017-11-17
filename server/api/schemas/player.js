'use strict';

// grab the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

// module.exports allows us to pass this to other files when it is called
var playerSchema = new Schema({
    name: {type: String, required: true, unique: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    userId: {type: String, required: true},
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

playerSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

playerSchema.methods.validPassword = function(password) {
    bcrypt.compareSync(password, this.password);    
};

module.exports = mongoose.model('Player', playerSchema);