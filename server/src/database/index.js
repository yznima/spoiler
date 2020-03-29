'use strict';
const debug = require('debug')('@database:main');
const configdb = require('config').get('database').mongodb;
const mongoose = require('mongoose');
const blueBird = require('bluebird');
const UserSchema = require('./UserSchema');

module.exports.init = databaseInit;
module.exports.UserSchema = UserSchema;

/**
 * Perform initialization for database module
 */
function databaseInit() {
    const mongodbURI = 'mongodb://' + configdb.host + '/' + configdb.dbName;
    mongoose.connect(mongodbURI, {
        useMongoClient: true,
        /* other options */
    });
    mongoose.Promise = blueBird;
    debug('Initialized database module ...');
}
