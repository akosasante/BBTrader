const LocalStrategy = require('passport-local').Strategy;
const Player = require('../api/schemas/player');

function configPassport(passport) {
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    }, (email, password, done) => {
        Player.findOne({ 'email': email }).then(user => {
            if(!user) {
                return done('No user with this email exists in the league database');
            } else if(user.password) {
                return done('Password has already been set for this user. Please contact the administrator');
            } else {
                user.password = user.generateHash(password);
                user.save().then(savedUser => {
                    console.log(savedUser);
                    return done(null, savedUser);
                });
            }
        }).catch(err => {
            return done(err);
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    }, (email, password, done) => {
        Player.findOne({ 'email': email }).then(user => {
            if(!user) {
                return done('No user with this email exists in the league database');
            } else if(!(user.validPassword(password))) {
                return done('Oops! Are you sure you used the right password?');
            } else {
                return done(null, user);
            }
        });
    }));
}

module.exports = configPassport;