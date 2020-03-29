const debug = require('debug')('@server:main');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const passport = require('passport');
const serverAPI = require('./server-route');
const database = require('./database');
const api = require('./api');
const middleware = require('./middleware');

const cookieOptions = {
    name: 'session',
    keys: ['Million Dollar', 'Steve Jobs'],
    httpOnly: true,
    maxAge: 60 * 60 * 2 * 1000,
    /* 2 hour */
    cookie: {
        secure: true,
        httpOnly: true
    }
};

module.exports = () => {
    app.set('trust proxy', true);
    app.set('trust proxy', 'loopback');

    // Middle-ware
    app.use(cookieSession(cookieOptions));
    debug('Added Cookie-Session');

    app.use(helmet());
    debug('Added Helmet');

    app.use(bodyParser.json({
        limit: '5mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '5mb',
        extended: true
    }));
    debug('Added body-parser');

    app.use(cookieParser());
    debug('Added cookie-parser');

    if (process.env.NODE_ENV === 'dev') {
        app.use(morgan('dev'));
        debug('Added morgen logger');
    }

    app.use(passport.initialize());
    app.use(passport.session());
    debug('Added passport');
    // app.use(passport.authenticate('remember-me'));

    app.use('/public', express.static(path.join(__dirname, '..', 'public')));
    debug('Serving static files from public/');

    app.use('/doc/', express.static(path.join(__dirname, '..', 'doc')));
    debug('Serving documents files from pdoc/');

    app.use('/api', function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4002');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers',
            'Origin, ' +
            'Accept, ' +
            'Content-Type, ' +
            'Set-Cookies, ' +
            'X-Requested-With, ' +
            'Access-Control-Allow-Headers, ' +
            'Access-Control-Request-Method, ' +
            'Access-Control-Request-Headers'
        );
        next();
    });

    app.use('/api', serverAPI);

    // Don't send error information back to user
    app.use((err, req, res, next) => {
        res.status(500).send({
            message: err.message
        }).end();
        next();
    });

    database.init();
    api.init();
    middleware.init();
    return app;
};
