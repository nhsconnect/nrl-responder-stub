import express from 'express';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';
import handleRetrievalRequest from './handle-retrieval-request';
import getUrls from './get-urls';

const config = require('./config.json');
const providerData: IProviderData = require('./static/provider-data.json');

const { testServerPort, logOutput } = config;
const port = testServerPort || 5000;

const app = express();

const logs: any[] = [];

const logFileName = `${new Date().toISOString().slice(0, -5).replace(/\D/g, '-')}.json`;
const logDir = path.join(__dirname, 'logs');
const logPath = path.join(logDir, logFileName);

const log = (newLog: any) => {
    logs.push(newLog);

    if (logOutput.stdout) {
        console.log(JSON.parse(JSON.stringify(newLog)));
    }

    if (logOutput.logsDir) {
        fs.writeFileSync(logPath, JSON.stringify(logs), 'utf-8');
    }
};

const constructEndpoint = (url: string) => `/${encodeURIComponent(url)}`;

const start = () => {
    const urls = getUrls(providerData);

    const endpoints = urls.map(url => `http://localhost:${port}${constructEndpoint(url)}`);

    // populate `res.body` on `send` or `sendFile`, for logging purposes
    app.use(function (_req, res, next) {
        const send = res.send;

        (res.send as any) = function (this: any, stringOrBuffer: string | Buffer) {
            (res as any).body = stringOrBuffer instanceof Buffer
                ? stringOrBuffer.toString()
                : stringOrBuffer;

            send.call(this, stringOrBuffer);
        };

        const sendFile = res.sendFile;

        (res.sendFile as any) = function (this: any, path: string, ...args: any) {
            const filename = path.match(/[^\\/]+$/)?.[0];

            (res as any).body = `[file ${filename}]`;

            (sendFile as any).call(this, path, ...args);
        };

        return next();
    });

    // logging
    app.use((req: IRequest, res: IResponse, next) => {
        if (!['/', '/urls', '/favicon.ico', '/endpoints'].includes(req.path)) {
            res.tests = [];

            res.on('finish', function () {
                const { headers, httpVersion, method, path, body: requestBody } = req;
                const { statusCode, body: responseBody, tests } = res;
                
                    const data = {
                        req: { headers, httpVersion, method, path, body: requestBody },
                        res: { statusCode, headers: res.getHeaders(), body: responseBody, tests }
                    };

                    if (method === 'GET') delete data.req.body;

                    log(data);
            });
        }

        return next();
    });

    // prevent unnecessary console errors if viewed in browser
    app.get('/favicon.ico', (_req, res) => res.sendStatus(httpStatus.NoContent));

    app.get('/', (_req, res) => {
        // generated from src/README.md during build
        return res.sendFile(path.join(__dirname, 'README.html'));
    });

    app.get('/urls', (_req, res) => {
        return res.json({ urls });
    });

    app.get('/endpoints', (_req, res) => { // TODO - for testing
        return res.json({ endpoints });
    });

    app.get('/:url', (req, res) => handleRetrievalRequest(req, res));

    app.get('*', (_req, res, next) => {
        res
            .status(httpStatus.BadRequest)
            .send('Provider URL must be percent-encoded (cannot contain unescaped forward-slashes)');
        
        return next();
    });

    app.listen(port, () => {
        console.log(`App running at ${chalk.cyan.bold.underline(`http://localhost:${port}`)}.`);

        console.log(`Press ${chalk.cyan.bold('Ctrl + C')} to stop server.`);

        if (logOutput.logsDir) {
            fs.mkdirSync(logDir, { recursive: true });
            fs.writeFileSync(logPath, JSON.stringify(logs), 'utf-8'); // empty logs arr

            console.log(`Logs from this session will be available at ${chalk.cyan.bold(logPath)}.`);
        }
    });
};

export default {
    start
};
