/**
 * Handles all app routing
 * 
 * All requests are simply passed on to the logic in
 * './get-from-mock-endpoint', running all validations in sequence.
 */

import express, { Errback } from 'express';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';
import config from './config';
import getFromMockEndpoint from './get-from-mock-endpoint';

import { logs, reportsDir, reportPath } from './logs';

import https from 'https';

const {
    port,
    logBodyMaxLength,
    reportOutputs,
    secureMode,
    sslServerCert,
    sslServerKey,
} = config;

const app = express();

const truncate = (str: string, maxLen: number) => {
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '...';
};

const start = () => {
    app.use(function (_request, response: IResponse, next) {
        // populate `response.body` on `sendFile`, for logging purposes
        // this allows output reports to include snippets of the response body

        const sendFile = response.sendFile;

        response.sendFile = function (this: any, path: string, fn?: Errback | undefined) {

            const body = fs.readFileSync(path, 'utf8');

            switch (logBodyMaxLength) {
                case -1:
                    response.body = body;
                    break;
                case 0:
                    // no-op - body not added to log
                    break;
                default:
                    response.body = truncate(body, logBodyMaxLength);
                    break;
            }

            sendFile.call(this, path, fn);
        };

        return next();
    });

    // for docs
    app.use('/assets', express.static(path.join(__dirname, 'assets')));

    // prevent unnecessary console errors if viewed in browser
    app.get('/favicon.ico', (_request, response) => response.sendStatus(httpStatus.NoContent));

    app.get('/', (_request, response) => {
        // serve user docs at app root
        // this is generated from lib/docs.md during build
        return response.sendFile(path.join(__dirname, 'docs.html'));
    });

    // callback must be provided like this - Express silently ignores callbacks with cardinality > 3
    app.get('*', (...args) => getFromMockEndpoint(...args));

    const server = secureMode
        ? https.createServer({
            key: fs.readFileSync(sslServerKey as string),
            cert: fs.readFileSync(sslServerCert as string),
            requestCert: true,
            rejectUnauthorized: false,
            ca: [fs.readFileSync(process.env.NODE_EXTRA_CA_CERTS as string)],
        }, app)
        : app;

    server
        .listen(port, () => {
            const nodeVersion = process.versions.node;
            const major = parseInt(nodeVersion.split('.')[0], 10);

            if (major < 10) {
                console.log(chalk.red(`WARNING! Current Node.js version is ${nodeVersion}. Version 10.x.x or higher required.`));
            }

            console.log(`App running in ${secureMode ? chalk.green.bold('secure') : chalk.red.bold('insecure')} mode.`)

            console.log(`Docs at ${chalk.cyan.bold.underline(`${secureMode ? 'https' : 'http'}://localhost:${port}`)}.`);

            console.log(`Press ${chalk.cyan.bold('Ctrl + C')} to stop server.`);

            if (reportOutputs.reportsDir) {
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }

                fs.writeFileSync(reportPath, JSON.stringify({ logs }), 'utf-8'); // empty logs array

                console.log(`Logs from this session will be available at ${chalk.cyan.bold(reportPath)}.`);
            }
        });
};

export default {
    start,
};
