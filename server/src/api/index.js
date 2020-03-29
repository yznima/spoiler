'use strict';
const debug = require('debug')('@api:main');
const userApi = require('./user-api');

module.exports.init = apiInit;
module.exports.user = userApi;

/**
 * Perform initialization for the API module.
 */
function apiInit() {
    debug('Initialized Api module ... ');
}
