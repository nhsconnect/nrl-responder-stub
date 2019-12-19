import express from 'express';
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
    app.use(function (_req, res, next) {
        const sendFile = res.sendFile;

        res.sendFile = function (this: any, path: string, ...args: any) {
            // const filename = path.match(/[^\\/]+$/)?.[0];

            const body = fs.readFileSync(path, 'utf8');

            switch (logBodyMaxLength) {
                case -1:
                    (res as any).body = body;
                    break;
                case 0:
                    // body not added to log
                    break;
                default:
                    (res as any).body = truncate(body, logBodyMaxLength);
                    break;
            }

            (sendFile as any).call(this, path, ...args);
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
        guidedTestPlan.reduce(async (promiseChain, testCase) => {
            await promiseChain;

            const endpoint = normaliseRootEndpoint(testCase.endpoint).withSlash;

            const nextPromise: Promise<void> = new Promise((resolve, _reject) => {
                console.log(`\nHit endpoint ${chalk.cyan.bold(endpoint)}.`);

                app.get(endpoint, resolve);
            });

            return nextPromise;
        }, Promise.resolve());
    }

    app.get('*', getFromMockEndpoint);

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
