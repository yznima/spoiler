'use strict';
// eslint-disable-next-line no-unused-vars
const debug = require('debug')('@api:user');
const passport = require('passport');
const db = require('../database/index');
const User = db.UserSchema.User;

const isDevOrTest = () => process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test';
/**
 * @api {get} /dev/user/getall Gets all the users
 * @apiName GetAll Users
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiPrivate
 */
const userGetAll = {
    path: '/user/getall',
    version: 'dev',
    method: 'GET',
    handler: (req, res) => {
        if (!isDevOrTest()) {
            res.sendStatus(404);
        } else {
            User.find({}, 'username firstname lastname').exec().then((users, err) => {
                if (users) {
                    res.status(200).send(JSON.stringify(users));
                } else {
                    res.status(500).send(err);
                }
            });
        }
    }
};

/**
 * @api {post} /v1/user/signup Sign-up a new user
 * @apiName SignUp User
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "username": "JoeOliver"
 *     }
 */
const userSignUpAPI = {
    path: '/user/signup',
    version: 'v1',
    method: 'POST',
    handler: (req, res) => {
        const body = User.getSanitizedInput(req.body);
        if (!body.password || !body.username || !body.email || !body.firstname || !body.lastname) {
            res.session = null;
            res.status(400).json({message: 'Missing required information'});
            return;
        }

        body.signupdate = body.lastlogindate = Date.now();
        // notify me when client connection is lost
        User.validateFields(req.body).then((possibleUser) =>
            User.findOne({
                $or: [{
                    username: possibleUser.username.trim().toLowerCase()
                }, {
                    email: possibleUser.email.trim().toLowerCase()
                }]
            }).exec()).then((userFound) => {
            if (userFound === null) {
                return new User(body).save();
            } else {
                const existingField = userFound.username === body.username ?
                    'Username ' + body.username :
                    'Email address ' + body.email;
                throw new Error(`${existingField} already exists`);
            }
        }).then((savedUser) => {
            if (savedUser === null || savedUser === undefined) {
                throw new Error('Problem signing up. Please try again');
            } else {
                req.session = {
                    _id: savedUser._id,
                    username: savedUser.username,
                    firstname: savedUser.firstname,
                    lastname: savedUser.lastname
                };
                res.status(200).json({username: savedUser.username});
            }
        }).catch((err) => res.status(400).json({message: err.message}));
    }
};

/**
 * @api {post} /v1/user/login Sign-up a new user
 * @apiName Login User
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
const userSignoutAPI = {
    path: '/user/signout',
    version: 'v1',
    method: 'POST',
    handler: (req, res, next) => {
        if (req.session._id) {
            req.session = null;
            res.status(200).json({'message': 'User successfully signed out'});
            return;
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                next(err);
            } else if (!user) {
                res.status(401).json(info).end();
            } else {
                req.session = null;
                res.status(200).json({'message': 'User successfully signed out'});
            }
        })(req, res, next);
    }
};

/**
 * @api {post} /v1/user/login Sign-up a new user
 * @apiName Login User
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
const userLoginAPI = {
    path: '/user/login',
    version: 'v1',
    method: 'POST',
    handler: (req, res, next) => {
        if (req.session._id) {
            const userSession = req.session;
            res.status(200).json({
                username: userSession.username,
                firstname: userSession.firstname,
                lastname: userSession.lastname
            });
            return;
        }
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                next(err);
            } else if (!user) {
                res.status(401).json(info).end();
            } else {
                User.findOneAndUpdate({
                    username: user.username
                }, {
                    $set: {
                        lastlogindate: Date.now()
                    }
                }).exec();
                req.session = {
                    _id: user._id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname
                };
                res.status(200).json({
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname
                });
            }
        })(req, res, next);
    }
};
/**
 * @api {post} /v1/user/update Sign-up a new user
 * @apiName Update User Information
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
const userUpdateAPI = {
    path: '/user/update',
    version: 'v1',
    method: 'POST',
    handler: (req, res, next) => {
        const body = User.getSanitizedInput(req.body);
        passport.authenticate('local', (err, user, info) => {
            delete body.password;
            delete body.username;
            if (err) {
                next(err);
            } else if (!user) {
                res.status(401).json(info);
            } else if (Object.keys(body).length === 0) {
                res.status(400).json({message: 'Nothing to update'});
            } else if (body.lastlogindate || body.signupdate) {
                res.status(400).json({
                    message: `Can't update the field ${body.lastlogindate ? 'lastlogindate' : 'signupdate'}`
                }).end();
            } else {
                User.findOneAndUpdate(
                    {username: user.username}, // Filter
                    {$set: body}, // update
                    {returnNewDocument: true}
                ).exec((err, updatedUser) => {
                    if (updatedUser) {
                        res.status(200).json({username: updatedUser.username});
                    } else if (err) {
                        res.status(400).json({message: err.message});
                    } else {
                        res.status(400).json({message: 'Unable updating user information.'});
                    }
                });
            }
        })(req, res, next);
    }
};
/**
 * @api {post} /v1/user/pupdate Sign-up a new user
 * @apiName Update User Password
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
const userPUpdateAPI = {
    path: '/user/pupdate',
    version: 'v1',
    method: 'POST',
    handler: (req, res, next) => {
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        if (!newPassword || !confirmPassword) {
            res.status(400).json({message: 'Missing "New Password" or "Confirm Password" field'}).end();
        } else if (newPassword !== confirmPassword) {
            res.status(400).json({message: '"New Password" and "Confirm Password" don\'t match'}).end();
        } else if (newPassword === password) {
            res.status(400).json({message: 'Can\'t set the new password to old password'}).end();
        } else {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    next(err);
                } else if (!user) {
                    res.status(401).json(info);
                } else {
                    User.findOneAndUpdate(
                        {username: user.username}, // Filter
                        {$set: {password: newPassword}},
                        {returnNewDocument: true}
                    ).exec((err, updatedUser) => {
                        if (updatedUser) {
                            res.status(200).json({username: updatedUser.username});
                        } else if (err) {
                            res.status(400).json({message: err.message});
                        } else {
                            res.status(400).json({message: 'Unable updating user password.'});
                        }
                    });
                }
            })(req, res, next);
        }
    }
};
/**
 * @api {post} /v1/user/pupdate Sign-up a new user
 * @apiName Update User Password
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Users user-name.
 * @apiParam {String} password Users password.
 * @apiParam {String} firstname Users first-name.
 * @apiParam {String} lastname Users last-name.
 * @apiParam {String} email Users email address.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "JoeOliver",
 *       "password": "TodayIsA@GoodDay"
 *       "firstname": "Joe",
 *       "lastname": "Oliver",
 *       "email": "Joe.oliver@gmail.com"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 */
const userDeleteAPI = {
    path: '/user/delete',
    version: 'v1',
    method: 'POST',
    handler: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                next(err);
            } else if (!user) {
                res.status(401).json(info);
            } else {
                User.remove({username: user.username}).exec((err) => {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.status(400).json({
                            message: 'Error deleting the user'
                        });
                    }
                });
            }
        })(req, res, next);
    }
};

module.exports = {
    userLoginAPI,
    userUpdateAPI,
    userSignoutAPI,
    userSignUpAPI,
    userPUpdateAPI,
    userDeleteAPI,
    userGetAll
};
