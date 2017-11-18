const crypto = require('crypto');
const emailController = require('../api/email/controller');
const Player = require('../api/schemas/player');

function initAuth(app, passport) {
    app.post('/auth/signup', (req, res, next) => {
        passport.authenticate('local-signup', function(err, user) {
            if(!err) {
                res.json({ message: 'User signed up', response: user });
            } else {
                res.status(500).send({ message: 'Something went wrong', error: err });
            }
        })(req, res, next);
    });
    app.post('/auth/login', (req, res) => {
        passport.authenticate('local-login', (err, user) => {
            if(!err) {
                res.json({ message: 'User logged in', response: user });
            } else {
                res.status(500).send({ message: 'Something went wrong', error: err });
            }
        })(req, res);
    });
    app.post('/auth/forgot', (req, res) => {
        const token = crypto.randomBytes(20).toString('hex');
        console.log(req.body);
        Player.findOne({ email: req.body.email }).then(user => {
            if(!user) {
                res.status(500).send({ message: 'Something went wrong', error: 'No user with this email exists in the league database' });
            } else {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;
                user.save().then(savedUser => {
                    emailController.sendPasswordResetEmail(savedUser);
                    res.json({ message: 'Retrieved forgot password token'});
                });
            }
        });
    });
    app.get('/auth/reset/:token', (req, res) => {
        Player.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }).then(user => {
            if(!user) {
                res.status(500).send({ message: 'Something went wrong', error: 'Password reset token was either invalid or expired'});
            } else {
                res.json({ message: 'Reseting password for user' });
            }
        });
    });
    app.post('/auth/reset/:token', (req, res) => {
        Player.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }).then(user => {
            if(!user) {
                res.status(500).send({ message: 'Something went wrong', error: 'Password reset token was either invalid or expired'});
            } else {
                user.password = user.generateHash(req.body.password);
                user.resetPasswordExpires = undefined;
                user.resetPasswordToken = undefined;
                user.save().then(savedUser => {
                    emailController.sendPasswordConfirmEmail(savedUser);
                    res.json({ message: 'Resetted the password' });
                });
            }
        });
    });
}

module.exports = initAuth;