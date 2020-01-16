/**
 * Handles all app routing
 *
 * This works slightly differently in `guided` vs. `exploratory mode:
 *
 * In `guided` mode, endpoints are registered dynamically, using a promise
 * chain wherein each promise resolves after the endpoint in question is hit,
 * triggering the next endpoint to be registered. Upon hitting each endpoint,
 * requests are passed to the logic in './get-from-mock-endpoint', running only
 * the relevant validations as configured in the test plan. The endpoints and
 * config in question can be found in `./guided-test-plan`.
 * 
 * In `exploratory` mode, all requests are simply passed on to the logic in
 * './get-from-mock-endpoint', running all validations in sequence.
 */

import express, { Errback } from 'express';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';
import config from './config';
import getFromMockEndpoint from './get-from-mock-endpoint';

import guidedTestPlan from './guided-test-plan';

import { logs, reportsDir, reportPath } from './logs';
import { normaliseRootEndpoint } from './utils';

import https from 'https';

const {
    port,
    logBodyMaxLength,
    reportOutputs,
    mode,
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

    // prevent unnecessary console errors if viewed in browser
    app.get('/favicon.ico', (_request, response) => response.sendStatus(httpStatus.NoContent));

    app.get('/', (_request, response) => {
        // serve user docs at app root
        // this is generated from src/README.md during build
        return response.sendFile(path.join(__dirname, 'README.html'));
    });

    if (mode === 'guided') {
        (async () => {
            await guidedTestPlan.reduce(async (promiseChain, testCase) => {
                await promiseChain;

                const endpoint = normaliseRootEndpoint(testCase.endpoint).withSlash;

                const nextPromise: Promise<void> = new Promise((resolve, _reject) => {
                    console.log(`\nHit endpoint ${chalk.cyan.bold(endpoint)}.`);

                    let hasRun = false;

                    app.get(endpoint, (request, response, next) => {
                        if (!hasRun) {
                            hasRun = true;

                            getFromMockEndpoint(request, response, next, testCase);

                            resolve(); // proceed to next promise in the chain
                        } else {
                            next();
                        }
                    });
                });

                return nextPromise;
            }, Promise.resolve()); // initial value for `reduce` is a resolved promise, initiating the promise chain

            console.log('All tests completed.');

            process.exit();
        })();
    } else {
        // callback must be provided like this - Express silently ignores callbacks with cardinality > 3
        app.get('*', (...args) => getFromMockEndpoint(...args));
    }

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
