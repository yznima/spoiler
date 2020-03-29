'use strict';
/**
 *  This should include all the routing in the server
 *  If there is any file or handler created that should
 *  listen on a path add it to the 'routes' and it should
 *  be added to the listeners
 *  Note: It will be cleaner if function are in different
 *  files than this file and are imported here
 */
const debug = require('debug')('@server:router');
const configName = require('config').get('name');
// eslint-disable-next-line new-cap
const apiRouter = require('express').Router();
const api = require('./api');
const userApi = api.user;

for (let api in userApi) {
    if (userApi.hasOwnProperty(api)) {
        const apiObj = userApi[api];
        const apiMethod = apiObj.method.toLowerCase();
        debug(`Installing route handler {method:${apiMethod}, path:${apiObj.path}}`);
        apiRouter[apiMethod]('/' + apiObj.version + apiObj.path, apiObj.handler);
    }
}

/**
 * Function that will verify that api/v1 is accessed
 * @param  {object} req The request http
 * @param  {object} res The http response
 * @param  {object} err The err
 */
function apiV1Handler(req, res, err) {
    let apiV1 = {message: `You have accessed ${configName} API`};
    res.status(200).send(apiV1).end();
}

/**
 * @api {get} /api/v1 Validates the API entry
 * @apiName APIValidator
 * @apiGroup General
 *
 * @apiSuccess {String} msg The message that validates this is correct API
 */
apiRouter.get('/', apiV1Handler);
module.exports = apiRouter;
