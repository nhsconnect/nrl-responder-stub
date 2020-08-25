/**
 * Handles all app routing
 *
 * All requests are simply passed on to the logic in
 * './get-from-mock-endpoint', running all validations in sequence.
 */

import express, { Errback, Request } from 'express';
import chalk from 'chalk';
import fsSync from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import httpStatus from './http-status';
import config from './config';
import getFromMockEndpoint from './get-from-mock-endpoint';

import { logs, reportsDir, reportPath } from './logs';

import https from 'https';
import checkSecureMode from './check-secure-mode';

import { responseBodies } from './request-response-extensions';
import {
    apiDirPath,
    endpointToFilePath,
    addToFileEndpointMapping,
    endpointToFileName,
    deleteFromFileEndpointMapping,
} from './file-endpoint-mapping';

import { promises as fs } from 'fs';

import { v4 as generateUuid } from 'uuid';

const {
    port,
    logBodyMaxLength,
    reportOutputs,
    sslServerCert,
    sslServerKey,
} = config;

const secureMode = checkSecureMode(config);

const app = express();

const truncate = (str: string, maxLen: number) => {
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '...';
};

const getRawExt = (request: Request) => {
    const contentType = request
        .header('Content-Type')
        ?.match(/[a-z-]+\/(?:[a-z-]+\+)?([a-z-]+)(?:;[a-z-]+)?/i)?.[1];

    if (contentType) {
        return contentType === 'plain' ? 'txt' : contentType;
    } else if (/\s*</.test(request.body)) {
        return 'xml';
    } else {
        try {
            const parsed = JSON.parse(request.body);

            if (parsed && typeof parsed === 'object') {
                return 'json';
            }
        } catch (_e) {
            return undefined;
        }
    }

    return undefined;
};

const start = () => {
    app.use(bodyParser.text({ type: '*/*' }));

    // maintain :: create
    app.post('*', async (request, response, _next) => {
        const baseUrl = `${request.protocol}://${request.get('host')}`;

        const uuid = generateUuid();

        const _rawExt = getRawExt(request);

        const ext = _rawExt ? `.${_rawExt}` : '';

        const fileName = `${uuid}${ext}`;

        const pathName = `${request.originalUrl}${
            request.originalUrl.endsWith('/') ? '' : '/'
        }${fileName}`;

        const location = `${baseUrl}${pathName}`;

        try {
            new URL(location);
        } catch (e) {
            return response
                .status(httpStatus.BadRequest)
                .send(`${location} is not a valid URL`);
        }

        if (!fsSync.existsSync(apiDirPath)) {
            fsSync.mkdirSync(apiDirPath);
        }

        const dateTime = new Date();

        await fs.writeFile(
            endpointToFilePath(pathName, dateTime),
            request.body,
        );

        response.header('Location', location);

        addToFileEndpointMapping(endpointToFileName(pathName, dateTime));

        return response.sendStatus(httpStatus.Created);
    });

    // maintain :: delete
    app.delete('*', async (request, response, _next) => {
        const result = deleteFromFileEndpointMapping(request.originalUrl);

        return response.sendStatus(
            result ? httpStatus.OK : httpStatus.NotFound,
        );
    });

    app.use(function (_request, response, next) {
        // populate `response.body` on `sendFile`, for logging purposes
        // this allows output reports to include snippets of the response body

        const sendFile = response.sendFile;

        response.sendFile = async function (
            this: any,
            path: string,
            fn?: Errback | undefined,
        ) {
            const body = await fs.readFile(path, 'utf8');

            switch (logBodyMaxLength) {
                case -1:
                    responseBodies.set(response, body);
                    break;
                case 0:
                    // no-op - body not added to log
                    break;
                default:
                    responseBodies.set(
                        response,
                        truncate(body, logBodyMaxLength),
                    );
                    break;
            }

            sendFile.call(this, path, fn);
        };

        return next();
    });

    // for docs
    app.use('/assets', express.static(path.join(__dirname, 'assets')));

    // prevent unnecessary console errors if viewed in browser
    app.get('/favicon.ico', (_request, response) =>
        response.sendStatus(httpStatus.NoContent),
    );

    app.get('/', (_request, response) => {
        // serve user docs at app root
        // this is generated from lib/docs.md during build
        return response.sendFile(path.join(__dirname, 'docs.html'));
    });

    // callback must be provided like this - Express silently ignores callbacks with cardinality > 3
    app.get('*', (...args) => getFromMockEndpoint(...args));

    const server = secureMode
        ? https.createServer(
              {
                  key: fsSync.readFileSync(sslServerKey as string),
                  cert: fsSync.readFileSync(sslServerCert as string),
                  requestCert: true,
                  rejectUnauthorized: false,
                  ca: [
                      fsSync.readFileSync(
                          process.env.NODE_EXTRA_CA_CERTS as string,
                      ),
                  ],
              },
              app,
          )
        : app;

    server.listen(port, () => {
        const nodeVersion = process.versions.node;
        const major = parseInt(nodeVersion.split('.')[0], 10);

        if (major < 10) {
            console.info(
                chalk.red(
                    `WARNING! Current Node.js version is ${nodeVersion}. Version 10.x.x or higher required.`,
                ),
            );
        }

        console.info(
            `App running in ${
                secureMode
                    ? chalk.green.bold('secure')
                    : chalk.red.bold('insecure')
            } mode.`,
        );

        console.info(
            `Docs at ${chalk.cyan.bold.underline(
                `${secureMode ? 'https' : 'http'}://localhost:${port}`,
            )}.`,
        );

        console.info(`Press ${chalk.cyan.bold('Ctrl + C')} to stop server.`);

        if (reportOutputs.reportsDir) {
            if (!fsSync.existsSync(reportsDir)) {
                fsSync.mkdirSync(reportsDir, {
                    recursive: true,
                });
            }

            fsSync.writeFileSync(reportPath, JSON.stringify({ logs }), 'utf-8'); // empty logs array

            console.info(
                `Logs from this session will be available at ${chalk.cyan.bold(
                    reportPath,
                )}.`,
            );
        }
    });
};

export default {
    start,
};
