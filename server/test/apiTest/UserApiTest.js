/* eslint-disable no-undef */
'use strict';
const clone = require('deepcopy');
const bcrypt = require('bcrypt');

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../../src/server')();
const User = require('../../src/database').UserSchema.User;

// Objects
const UserOne = require('./MockedObject/UserOne.json');
const _2000Users = require('./MockedObject/2000Users.json');
const _10000Users = require('./MockedObject/10000Users.json');

const URL_USER_GET_ALL = '/api/dev/user/getall';
const URL_USER_LOGIN = '/api/v1/user/login';
const URL_USER_SIGN_UP = '/api/v1/user/signup';
const URL_USER_SIGN_OUT = '/api/v1/user/signout';
const URL_USER_UPDATE = '/api/v1/user/update';
const URL_USER_DELETE = '/api/v1/user/delete';
const URL_USER_PSSWD_UPDATE = '/api/v1/user/pupdate';

describe('APIUnitTest, GetAll', () => {
    after('Sanitize environment variable', () => process.env.NODE_ENV = null);

    it('Endpoint should be hidden in PROD mode', (done) => {
        process.env.NODE_ENV = 'prod';
        get(server, URL_USER_GET_ALL, 404).then(() => done()).catch((err) => done(err));
    });

    it('Endpoint shouldn\'t be hidden in TEST mode', (done) => {
        process.env.NODE_ENV = 'test';
        get(server, URL_USER_GET_ALL, 200).then(() => done()).catch((err) => done(err));
    });

    it('Endpoint shouldn\'t be hidden in DEV mode', (done) => {
        process.env.NODE_ENV = 'dev';
        get(server, URL_USER_GET_ALL, 200).then(() => done()).catch((err) => done(err));
    });
});

describe('APIUnitTest, SignUp', () => {
    afterEach('Delete all users!', () => User.remove({}).exec());

    it(`User information should be persisted`, (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => {
            User.count({
                username: UserOne.username.toLowerCase()
            }, (err, count) => {
                expect(err).to.not.exist;
                expect(count).to.be.equal(1);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`User password should be hashed!`, (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => {
            User.findOne({
                username: UserOne.username.toLowerCase()
            }, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user.password).to.not.equal(UserOne.password);
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.true;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Server shouldn't allow extra keys on login`, (done) => {
        const newUser = clone(UserOne);
        newUser.extra = 'SOMETHING THAT CAN BE HARMFULL';
        post(server, URL_USER_SIGN_UP, newUser, 400).then(() => {
            User.count({}, (err, count) => {
                expect(err).to.not.exist;
                expect(count).to.be.equal(0);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`User should have a "lastlogindate" field after login`, (done) => {
        const newUser = clone(UserOne);
        newUser.lastlogindate = new Date().getTime(); // Past
        post(server, URL_USER_SIGN_UP, newUser, 200).then(() => {
            User.findOne({
                username: newUser.username.toLowerCase()
            }, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user.lastlogindate.getTime()).to.not.equal(newUser.lastlogindate);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Signup two new user: ${UserOne.username}, should deny second one!`, (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => post(server, URL_USER_SIGN_UP, UserOne, 400)).then(() => {
            User.count({
                username: UserOne.username.toLowerCase()
            }, (err, count) => {
                expect(err).to.not.exist;
                expect(count).to.be.equal(1);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Signup two new user: ${UserOne.email}, should deny second one!`, (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => {
            const newUser = clone(UserOne);
            newUser.username = 'differentUsername'; // same email
            return post(server, URL_USER_SIGN_UP, newUser, 400);
        }).then(() => {
            User.count({
                email: UserOne.email.toLowerCase()
            }, (err, count) => {
                expect(err).to.not.exist;
                expect(count).to.be.equal(1);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Signup with empty username, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            'password': 'ValidPassword',
            'email': 'validEmail@email.com',
            'firstname': 'valid firstname',
            'lastname': 'valid lastname'
        }, done);
    });

    it(`Signup with short username, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            username: '_',
            password: 'ValidPassword',
            email: 'validEmail@email.com',
            firstname: 'valid firstname',
            lastname: 'valid lastname'
        }, done);
    });

    it(`Signup with long username, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            username: 'thisIsJustVeryLongPasswordSoShouldNotWorkAsUser',
            password: 'ValidPassword',
            email: 'validEmail@email.com',
            firstname: 'valid firstname',
            lastname: 'valid lastname'
        }, done);
    });

    it(`Signup with empty password, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            username: 'ValidUsername',
            email: 'validEmail@email.com',
            firstname: 'valid firstname',
            lastname: 'valid lastname'
        }, done);
    });

    it(`Signup with empty password, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            username: 'ValidUsername',
            email: 'validEmail@email.com',
            firstname: 'valid firstname',
            lastname: 'valid lastname'
        }, done);
    });

    it(`Signup with empty password, should not exist in db!`, (done) => {
        invalidUserSignUpCall({
            username: 'ValidUsername',
            email: 'validEmail@email.com',
            firstname: 'valid firstname',
            lastname: 'valid lastname'
        }, done);
    });

    xit(`Signup ${_10000Users.length} new users, should be able to handle`, function (done) {
        // eslint-disable-next-line no-invalid-this
        this.timeout(70000);
        const requestL = [];
        _2000Users.forEach(function (element) {
            requestL.push(makeRequest(200, options, element));
        });
        Promise.all(requestL).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    /**
     * Will try to sign up an invalid user and expects to get a 400 status.
     * @param {Object} invalidUser The invalid user to be signed up
     * @param {Function} done will be called when the responce status is validated.
     */
    function invalidUserSignUpCall(invalidUser, done) {
        post(server, URL_USER_SIGN_UP, invalidUser, 400).then(() => {
            User.count({}, (err, count) => {
                expect(err).to.not.exist;
                expect(count).to.be.equal(0);
                done();
            });
        }).catch((err) => done(err));
    }
});

describe('APIUnitTest, Login', () => {
    beforeEach('Sign up a new user', (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => done()).catch((err) => done(err));
    });

    afterEach('Delete all users!', () => User.remove({}).exec());

    it(`Login user ${UserOne.username}, authentication should be valid!`, (done) => {
        const userToLogin = {username: UserOne.username, password: UserOne.password};
        post(server, URL_USER_LOGIN, userToLogin, 200).then(() => {
            done();
        }).catch((err) => done(err));
    });

    it(`Login user ${UserOne.username}, authentication should be invalid!`, (done) => {
        const userToLogin = {username: UserOne.username, password: UserOne.password + '  '};
        post(server, URL_USER_LOGIN, userToLogin, 401).then(() => {
            done();
        }).catch((err) => done(err));
    });

    it(`Login user with no username, authentication should be invalid!`, (done) => {
        const userToLogin = {password: UserOne.password};
        post(server, URL_USER_LOGIN, userToLogin, 401).then(() => {
            done();
        }).catch((err) => done(err));
    });

    it(`Login user with no password, authentication should be invalid`, (done) => {
        const userToLogin = {username: UserOne.username};
        post(server, URL_USER_LOGIN, userToLogin, 401).then(() => {
            done();
        }).catch((err) => done(err));
    });
});

describe('APIUnitTest, Update', () => {
    beforeEach('Sign up a new user', (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => done()).catch((err) => done(err));
    });

    afterEach('Deleting all users!', () => User.remove({}).exec());

    it(`Update user ${UserOne.username}, should be updated!`, (done) => {
        const newFirstName = 'NEW FIRST NAME';
        const updatedUser = {
            username: UserOne.username,
            password: UserOne.password,
            firstname: newFirstName
        };
        post(server, URL_USER_UPDATE, updatedUser, 200).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user.firstname).to.equal(newFirstName);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user ${UserOne.username} with invalid password`, (done) => {
        const newFirstName = 'NEW FIRST NAME';
        const updatedUser = {
            username: UserOne.username,
            password: UserOne.password + ' ',
            firstname: newFirstName
        };
        post(server, URL_USER_UPDATE, updatedUser, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user.firstname).to.not.equal(newFirstName);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user ${UserOne.username}, with non-exisiting username`, (done) => {
        const newFirstName = 'NEW FIRST NAME';
        const updatedUser = {
            username: UserOne.username + 'X',
            password: UserOne.password,
            firstname: newFirstName
        };
        post(server, URL_USER_UPDATE, updatedUser, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user.firstname).to.not.equal(newFirstName);
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user ${UserOne.username}, nothing to update!`, (done) => {
        const updatedUser = {username: UserOne.username, password: UserOne.password};
        post(server, URL_USER_UPDATE, updatedUser, 400).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user ${UserOne.username}, trying to inject signupdate!`, (done) => {
        const lldate = new Date(0);
        const updatedUser = {
            username: UserOne.username,
            password: UserOne.password,
            lastlogindate: lldate
        };
        post(server, URL_USER_UPDATE, updatedUser, 400).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user.lastlogindate.getTime()).to.not.equal(lldate.getTime());
                done();
            });
        }).catch((err) => done(err));
    });
});

describe('APIUnitTest, Password Update', () => {
    beforeEach('Sign up a new user', (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => done()).catch((err) => done(err));
    });

    afterEach('Deleting all users!', () => User.remove({}).exec());

    it(`Update user password ${UserOne.username}, should be valid!`, (done) => {
        const newPassword = 'CHANGEDPASSWORD';
        const updatedUser = {
            username: UserOne.username,
            password: UserOne.password,
            newPassword: newPassword,
            confirmPassword: newPassword
        };
        post(server, URL_USER_PSSWD_UPDATE, updatedUser, 200).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.false;
                expect(bcrypt.compareSync(newPassword, user.password)).to.be.true;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user password ${UserOne.username}, invalid password!`, (done) => {
        const newPassword = 'CHANGEDPASSWORD';
        const updatedUser = {
            username: UserOne.username,
            password: UserOne.password + ' ',
            newPassword: newPassword,
            confirmPassword: newPassword
        };
        post(server, URL_USER_PSSWD_UPDATE, updatedUser, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.true;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user password ${UserOne.username}, information invalid user`, (done) => {
        const newPassword = 'CHANGEDPASSWORD';
        const userToUpdate = {
            username: UserOne.username + 'X',
            password: UserOne.password,
            newPassword: newPassword,
            confirmPassword: newPassword
        };
        post(server, URL_USER_PSSWD_UPDATE, userToUpdate, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.true;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user password ${UserOne.username}, missing confirm password`, (done) => {
        const newPassword = 'CHANGEDPASSWORD';
        const userToUpdate = {
            username: UserOne.username + ' ',
            password: UserOne.password,
            newPassword: newPassword
        };
        post(server, URL_USER_PSSWD_UPDATE, userToUpdate, 400).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(user).to.exist;
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.true;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Update user password ${UserOne.username} trying to inject signupdate`, (done) => {
        const lldate = new Date(0);
        const userToUpdate = {
            username: UserOne.username,
            password: UserOne.password,
            lastlogindate: lldate
        };
        post(server, URL_USER_PSSWD_UPDATE, userToUpdate, 400).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                expect(bcrypt.compareSync(UserOne.password, user.password)).to.be.true;
                expect(user.lastlogindate.getTime()).to.not.equal(lldate.getTime());
                done();
            });
        }).catch((err) => done(err));
    });
});

describe('APIUnitTest, User deletion', () => {
    beforeEach('Sign up a new user', (done) => {
        post(server, URL_USER_SIGN_UP, UserOne, 200).then(() => done()).catch((err) => done(err));
    });

    afterEach('Deleting all users!', () => User.remove({}).exec());

    it(`Delete user ${UserOne.username}, should be valid!`, (done) => {
        const userToDelete = {username: UserOne.username, password: UserOne.password};
        post(server, URL_USER_DELETE, userToDelete, 200).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.not.exist;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Delete ${UserOne.username}, invalid password!`, (done) => {
        const userToDelete = {username: UserOne.username, password: UserOne.password + ' '};
        post(server, URL_USER_DELETE, userToDelete, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                done();
            });
        }).catch((err) => done(err));
    });

    it(`Delete ${UserOne.username}, invalid username!`, (done) => {
        const userToDelete = {username: UserOne.username + 'X', password: UserOne.password};
        post(server, URL_USER_DELETE, userToDelete, 401).then(() => {
            User.findOne({username: UserOne.username.trim().toLowerCase()}, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.exist;
                done();
            });
        }).catch((err) => done(err));
    });
});

describe('APIUnitTest, Session Management', () => {
    afterEach('Deleting all users!', () => User.remove({}).exec());

    it('Signup, Users new session cookie should be set after signup', (done) => {
        const agent = chai.request.agent(server);
        // WHEN: User signs up
        agent.post(URL_USER_SIGN_UP).send(UserOne).then((res) => {
            // THEN: The cookie sessions are set for the user
            expect(res).to.have.cookie('session');
            expect(res).to.have.cookie('session.sig');
            // WHEN: User logs in using the cookie sessions
            return agent.post(URL_USER_LOGIN).send({});
        }).then((res) => {
            // THEN: Login should be successful
            expect(res).to.have.status(200);
            expect(res.body.username).to.be.equal(UserOne.username.trim().toLowerCase());
            expect(res.body.firstname).to.be.equal(UserOne.firstname);
            const newPassword = 'CHANGEDPASSWORD';
            const updatedUser = {
                username: UserOne.username,
                password: UserOne.password + 'X',
                newPassword: newPassword,
                confirmPassword: newPassword
            };
            // WHEN: User tries to change password using cookie session
            return agent.post(URL_USER_PSSWD_UPDATE).send(updatedUser);
        }).catch((err) => {
            // THEN: The request should be unsuccessful
            expect(err).to.have.status(401);
            const newFirstName = 'NEW FIRST NAME';
            const updatedUser = {
                username: UserOne.username,
                firstname: newFirstName
            };
            // WHEN: User tries to change user information using cookie session
            return agent.post(URL_USER_UPDATE).send(updatedUser);
        }).catch((err) => {
            // THEN: The request should be unsuccessful
            expect(err).to.have.status(401);
            // WHEN: User signs out using cookie sessions
            return agent.post(URL_USER_SIGN_OUT).send({});
        }).then((res) => {
            // THEN: The request should be successful
            expect(res).to.have.status(200);
            // WHEN: User tries to login again
            return agent.post(URL_USER_LOGIN).send({});
        }).catch((err) => {
            // THEN: The request should be unsuccessful
            expect(err).to.have.status(401);
            done();
        });
    });

    it('Signup, Users new session cookie should be set after login', (done) => {
        const agent = chai.request.agent(server);

        // GIVEN: User already exist
        post(server, URL_USER_SIGN_UP, UserOne, 200).then((res) => {
            expect(res).to.have.status(200);
            // WHEN: User logs in
            return agent.post(URL_USER_LOGIN).send({
                username: UserOne.username, password: UserOne.password
            });
        }).then((res) => {
            // THEN: The cookie sessions are set for the user
            expect(res).to.have.cookie('session');
            expect(res).to.have.cookie('session.sig');
            // WHEN: User logs in using the cookie sessions
            return agent.post(URL_USER_LOGIN).send({});
        }).then((res) => {
            // THEN: Login should be successful
            expect(res).to.have.status(200);
            expect(res.body.username).to.be.equal(UserOne.username.trim().toLowerCase());
            expect(res.body.firstname).to.be.equal(UserOne.firstname);
            // WHEN: User signs out using cookie sessions
            return agent.post(URL_USER_SIGN_OUT).send({});
        }).then((res) => {
            // THEN: The request should be successful
            expect(res).to.have.status(200);
            // WHEN: User tries to login again
            return agent.post(URL_USER_LOGIN).send({});
        }).catch((err) => {
            // THEN: The request should be unsuccessful
            expect(err).to.have.status(401);
            done();
        });
    });
});
/**
 * Given the appServer, an connect or express based app, will start the server
 * on an available port. Then access the given URL using HTTP 'GET' method. If
 * the status code matches the expectedStatus and no error the promise will
 * be resolved. Otherwise the promise will be rejected.
 * @param {Object} appServer
 * @param {String} url
 * @param {Number} expectedStatus
 * @return {Promise}
 */
function get(appServer, url, expectedStatus) {
    return new Promise((resolve, reject) => {
        chai.request(appServer).get(url).end((err, res) => {
            if (expectedStatus < 400 && err) {
                reject(err);
            } else {
                expect(res).to.have.status(expectedStatus);
                resolve(res);
            }
        });
    });
}

/**
 * Given the appServer, an connect or express based app, will start the server
 * on an available port. Then access the given URL using HTTP 'POST' method
 * and send the body as the body of request. If the status code matches the
 * expectedStatus and no error the promise will be resolved. Otherwise the
 * promise will be rejected.
 * @param {Object} appServer
 * @param {String} url
 * @param {JSON} body
 * @param {Number} expectedStatus
 * @return {Promise}
 */
function post(appServer, url, body, expectedStatus) {
    return new Promise((resolve, reject) => {
        chai.request(appServer).post(url).send(body).end((err, res) => {
            if (expectedStatus < 400 && err) {
                reject(err);
            } else {
                expect(res).to.have.status(expectedStatus);
                resolve(res);
            }
        });
    });
}
