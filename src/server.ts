import express from 'express';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';
import runTestCases from './run-test-cases';
import TestCases from './test-cases';
import setMimeType from './set-mime-type';

const { testServerPort, logOutput, logBodyMaxLength, urlFileMap } = require('./config.json');

const port = testServerPort || 5000;

const app = express();

const logs: any[] = [];

const logFileName = `${new Date().toISOString().slice(0, -5).replace(/\D/g, '-')}.json`;
const logDir = path.join(__dirname, 'logs');
const logPath = path.join(logDir, logFileName);

const truncate = (str: string, maxLen: number) => {
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '...';
};

const writeLog = (entry: any) => {
    logs.push(entry);

    if (logOutput.stdout) {
        console.log(JSON.parse(JSON.stringify(entry)));
    }

    if (logOutput.logsDir) {
        fs.writeFileSync(logPath, JSON.stringify(logs), 'utf-8');
    }
};

const buildLogEntry = (req: IRequest, res: IResponse, tcs?: ITestCases) => {
    const { headers, httpVersion, method, path, body: requestBody } = req;
    const { statusCode, body: responseBody } = res;

    const entry = {
        req: { headers, httpVersion, method, path, body: requestBody },
        res: { statusCode, headers: res.getHeaders(), body: responseBody },
        testCases: tcs?.allSerializable()
    };

    if (method === 'GET') delete entry.req.body;

    return entry;
};

const start = () => {
    // populate `res.body` on `sendFile`, for logging purposes
    app.use(function (_req, res, next) {
        const sendFile = res.sendFile;

        res.sendFile = function (this: any, path: string, ...args: any) {
            // const filename = path.match(/[^\\/]+$/)?.[0];

            const body = fs.readFileSync(path, 'utf8');

            (res as any).body = logBodyMaxLength
                ? truncate(body, logBodyMaxLength)
                : body;

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

    app.get('/:url', (req: IRequest, res: IResponse) => {
        const tcs = new TestCases(req, res);

        runTestCases(tcs);

        // logging
        res.on('finish', () => {
            const logEntry = buildLogEntry(req, res, tcs);
            writeLog(logEntry);
        });

        if (res.headersSent) {
            return;
        } 
        
        if (tcs.all().some(tc => !tc.success)) {
            const data = {
                failures: tcs.allSerializable().filter(tc => !tc.success)
            };

            return res
                .status(httpStatus.BadRequest)
                .json(data);
        } 
        
        try {
            new URL(req.params.url);
        } catch {
            return res
                .status(httpStatus.BadRequest)
                .send(`${req.params.url} is not a valid URL`);
        }

        const fileName = urlFileMap[req.params.url];
        
        if (!fileName) {
            return res
                .status(httpStatus.NotFound)
                .send(`URL ${req.params.url} must exist as a key in urlFileMap in config.json`);
        }

        const filePath = path.join(__dirname, 'responses', fileName);

        if (!fs.existsSync(filePath)) {
            return res
                .status(httpStatus.NotFound)
                .send(`fileName ${fileName} must exist as a file in the responses folder`);
        }

        setMimeType(tcs);

        return res.sendFile(filePath);
    });

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
