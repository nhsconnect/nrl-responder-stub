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

const {
    port,
    logBodyMaxLength,
    reportOutputs,
    mode,
} = config;

const app = express();

const truncate = (str: string, maxLen: number) => {
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '...';
};

const start = () => {
    // populate `res.body` on `sendFile`, for logging purposes

    app.use(function (_req, res: IResponse, next) {

        const sendFile = res.sendFile;

        res.sendFile = function (this: any, path: string, fn?: Errback | undefined) {

            const body = fs.readFileSync(path, 'utf8');

            switch (logBodyMaxLength) {
                case -1:
                    res.body = body;
                    break;
                case 0:
                    // noop - body not added to log
                    break;
                default:
                    res.body = truncate(body, logBodyMaxLength);
                    break;
            }

            sendFile.call(this, path, fn);
        };

        return next();
    });

    // prevent unnecessary console errors if viewed in browser
    app.get('/favicon.ico', (_req, res) => res.sendStatus(httpStatus.NoContent));

    app.get('/', (_req, res) => {
        // generated from src/README.md during build
        return res.sendFile(path.join(__dirname, 'README.html'));
    });


    if (mode === 'guided') {
        (async () => {
            await guidedTestPlan.reduce(async (promiseChain, testCase) => {
                await promiseChain;

                const endpoint = normaliseRootEndpoint(testCase.endpoint).withSlash;

                const nextPromise: Promise<void> = new Promise((resolve, _reject) => {
                    console.log(`\nHit endpoint ${chalk.cyan.bold(endpoint)}.`);

                    let hasRun = false;

                    app.get(endpoint, (req, res, next) => {
                        if (!hasRun) {
                            hasRun = true;

                            getFromMockEndpoint(req, res, next, testCase);
                            
                            resolve(); // proceed to next promise in the chain
                        } else {
                            next();
                        }
                    });
                });

                return nextPromise;
            }, Promise.resolve());

            console.log('All tests completed.');

            process.exit(0);
        })();
    } else {
        app.get('*', getFromMockEndpoint);
    }

    app.listen(port, () => {
        console.log(`App running at ${chalk.cyan.bold.underline(`http://localhost:${port}`)}.`);

        console.log(`Press ${chalk.cyan.bold('Ctrl + C')} to stop server.`);

        if (reportOutputs.reportsDir) {
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            fs.writeFileSync(reportPath, JSON.stringify({ logs }), 'utf-8'); // empty logs arr

            console.log(`Logs from this session will be available at ${chalk.cyan.bold(reportPath)}.`);
        }
    });
};

export default {
    start,
};
