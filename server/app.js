'use strict';

const appDebug = require('debug')('@app');
const http = require('http');
const cluster = require('cluster');
const https = require('https');
const fs = require('fs');
const appConfig = require('config').get('server');
const ArgumentParser = require('argparse').ArgumentParser;
const server = require('./src/server');

// Overriding the Global Promise to be Bluebird
global.Promise = require('bluebird');

if (require !== undefined && require.main === module) {
    const args = getParsedArgs();
    // Logically can't redirect HTTP to HTTPs if the
    // Https is not running
    if (!args.https && args.http_to_https) {
        appDebug('Can\'t use the "--http-to-https" without the --https flag!');
        process.exit(1);
    }

    const NODE_ENV = process.env.NODE_ENV;
    if (NODE_ENV !== 'prod' && NODE_ENV !== 'dev' && NODE_ENV !== 'test') {
        process.env.NODE_ENV = 'dev';
    }

    if (NODE_ENV === 'prod' && cluster.isMaster) {
        // Count the machine's CPUs
        const cpuCount = require('os').cpus().length;
        // Create two worker for each CPU
        for (let i = 0; i < cpuCount * 2; i += 1) {
            cluster.fork();
        }
    } else {
        startServer(args);
    }
}

/**
 * Will start both http and https server based on the arguments
 * used running the server
 * @param {dictionary} args
 */
function startServer(args) {
    const serverListener = server();
    // to the HTTPS server or act as the main server.
    const httpCallback = args.http_to_https ? function (req, res) {
        res.writeHead(301, {
            Location: 'https://localhost:' + args.https_port + req.url
        });
        res.end();
    } : serverListener;

    startHttp(httpCallback, args.http_port);
    if (args.https) {
        startHttps(serverListener, args.https_port);
    }
}

/**
 * Starts the server using the listener as an HTTP server on the port specified
 * @param {function():void} listener The express or connect like server
 * @param {String|Number} port The string or number of the port for HTTP server
 * @return {function():*} The function to be called to close the HTTP server
 */
function startHttp(listener, port) {
    const httpServer = http.createServer(listener);
    httpServer.listen(normalizePort(port));
    httpServer.on('error', serverOnError('HTTP server failed to start on port ' + port));
    httpServer.on('listening', serverOnListen('HTTP Server running on port ' + port));
    return () => httpServer.close();
}

/**
 * Starts the server using the listener as an HTTPS server on the port specified
 * @param {function():void} listener The express or connect like server
 * @param {String|Number} port The string or number of the port for HTTPS server
 * @return {null|function():*} The function to be called to close the HTTPS server
 */
function startHttps(listener, port) {
    const ssl = {
        key: getHTTPSSSLKey(),
        cert: getHTTPSSSLCert()
    };
    if (ssl.key === undefined) {
        appDebug('Couldn\'t extract SSL Key from environment variable.' +
            ' Make sure you SSL_KEY is set correctly');
    } else if (ssl.cert === undefined) {
        appDebug('Couldn\'t extract SSL Certificate from environment' +
            ' variable. Make sure you SSL_CERT is set correctly');
    } else {
        const httpsServer = https.createServer(ssl, listener);
        httpsServer.listen(normalizePort(port));
        httpsServer.on('error', serverOnError('HTTPS server failed to start on port ' + port));
        httpsServer.on('listening', serverOnListen('HTTPS Server running on port ' + port));
        return () => httpsServer.close();
    }
    return null;
}

/**
 * This version uses both HTTP and HTTPs. The SSL_KEY and SSL_CERT can be passed in as the
 * environment variables to spawn the HTTPs. If neither of these values exist the HTTPs
 * server will not run.
 * @return {dictionary} The parsed arguments passed in when ran by node.
 */
function getParsedArgs() {
    const parser = new ArgumentParser({
        version: '0.1.0',
        addHelp: true,
        description: 'A NodeJS boilerplate server that ' +
        'comes with support for users.'
    });

    parser.addArgument(['-p', '--http-port'], {
        defaultValue: appConfig.http.port,
        help: 'The port number to use for the HTTP server'
    });

    parser.addArgument('--https', {
        help: 'Will run the HTTPS server',
        defaultValue: appConfig.https.start,
        action: 'storeTrue'
    });

    parser.addArgument(['-s', '--https-port'], {
        defaultValue: appConfig.https.port,
        help: 'The port number to use for the HTTPS server.'
    });

    parser.addArgument('--http-to-https', {
        help: 'Will make the HTTP server re-route to the HTTPS server',
        defaultValue: appConfig.https.http_to_https,
        action: 'storeTrue'
    });

    return parser.parseArgs();
}

/**
 * Will return the port that server should run on
 * @param  {String|Number} port String or number representation of port
 * @return {Number} The normalized port number
 */
function normalizePort(port) {
    return typeof port !== 'number' ? parseInt(port, 10) : port;
}

/**
 * Function to be called when the server successfully opened
 * @param {String} logMsg The message to log
 * @return {function(): void}
 */
function serverOnListen(logMsg) {
    return () => appDebug(logMsg);
}

/**
 * Function to be called if the server failed opening
 * @param {String} logMsg The error to log
 * @return {function(Error): void} The error handler for server.listen
 */
function serverOnError(logMsg) {
    return (err) => {
        let errMsg;
        if (err.code === 'EADDRINUSE') {
            errMsg = 'Address is in use';
        } else if (err.code === 'EACCES') {
            errMsg = 'Unauthorized access';
        } else {
            errMsg = err.message;
        }
        appDebug(`${logMsg}. ErrorCode: ${err.code} - ${errMsg}`);
        process.exit(1);
    };
}

/**
 * Return the SSL Key for the HTTPS server using the
 * environment variable SSL_KEY
 * @return {string|null} The HTTPS SSL Key
 */
function getHTTPSSSLKey() {
    return process.env.SSL_KEY === undefined ? null : fs.readFileSync(process.env.SSL_KEY);
}

/**
 * Return the SSL Certificate for the HTTPS server using the
 * environment variable SSL_CERT
 * @return {string|null} The HTTPS SSL Certificate
 */
function getHTTPSSSLCert() {
    return process.env.SSL_CERT === undefined ? null : fs.readFileSync(process.env.SSL_CERT);
}

module.exports.startHttp = (port) => (
    startHttp(server(), port)
);
