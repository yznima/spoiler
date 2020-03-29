const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

module.exports = function (config) {
    config.set({
        frameworks: ['mocha'], //use the mocha test framework
        files: [
            'webpack.tests.js' // just load this file
        ],
        preprocessors: {
            'webpack.tests.js': ['webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
        },

        reporters: ['mocha'], //report results in this format
        webpack: { // kind of a copy of your webpack config
            resolve: webpackConfig.resolve,
            module: webpackConfig.module
        },
        webpackServer: {
            noInfo: true //please don't spam the console when running in karma!
        },
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome', 'Safari'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};