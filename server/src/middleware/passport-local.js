'use strict';
// eslint-disable-next-line no-unused-vars
const debug = require('debug')('@middleware:local');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../database').UserSchema.User;

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
module.exports = new LocalStrategy(PassportLocalVerify);

/**
 * The Passport Local Strategy function to verify that the
 * username with the given password is authenticated.
 *
 * @param {string}   username The Username for user
 * @param {string}   password The candidate password for user
 * @param {Function} done     The callback to be called when done verifying
 */
function PassportLocalVerify(username, password, done) {
    // Find the user by username.  If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message.  Otherwise, return the
    // authenticated `user`.
    const usernameLowerCased = username.trim().toLowerCase();
    User.findOne({
        $or: [{'username': usernameLowerCased}, {'email': usernameLowerCased}]
    }, function (err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, {message: 'Invalid combination of username/password'});
        }

        bcrypt.compare(password, user.password).then((result) => {
            if (result) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid combination of username/password'});
            }
        });
    });
}
