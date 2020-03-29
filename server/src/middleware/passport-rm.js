'use strict';
// eslint-disable-next-line no-unused-vars
const debug = require('debug')('@middleware:remember-me');
const RememberMeStrategy = require('passport-remember-me').Strategy;
// const User = require('../database').UserSchema.User;

/**
 * [RememberMeVerfiy description]
 * @param {[type]}   token [description]
 * @param {Function} done  [description]
 */
function rememberMeVerfiy(token, done) {

}

/**
 * [RememberMeIssue description]
 * @param {[type]}   user [description]
 * @param {Function} done [description]
 */
function rememberMeIssue(user, done) {

}

module.exports = new RememberMeStrategy(rememberMeVerfiy, rememberMeIssue);
