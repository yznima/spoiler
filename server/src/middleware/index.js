'use strict';
const debug = require('debug')('@middleware:main');
const passport = require('passport');
// eslint-disable-next-line no-unused-vars
const passportRememberMe = require('./passport-rm.js');
const passportLocal = require('./passport-local.js');
const User = require('../database').UserSchema.User;

module.exports.init = middlewareInit;

/**
 * [middlewareInit description]
 */
function middlewareInit() {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((userId, done) => {
        User.findOne({
            _id: userId
        }, (err, user) => {
            done(err, user);
        });
    });

    // passport.use(passportRememberMe);
    passport.use(passportLocal);
    debug('Initialized middleware module ... ');
}
