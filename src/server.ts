import express from 'express';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';
import runTests from './run-tests';
import Tests from './tests';
import setMimeType from './set-mime-type';
import config from './config';

const {
    port = 5000,
    logBodyMaxLength = -1,
    reportOutputs,
    providerPathFileMap,
    suppressedTestIds,
    endpointFormat
} = config;

const app = express();

const logs: any[] = [];
const meta = { suppressedTestIds };

const reportFileName = `${new Date().toISOString().slice(0, -5).replace(/\D/g, '-')}.json`;
const reportsDir = path.join(__dirname, 'reports');
const reportPath = path.join(reportsDir, reportFileName);

const truncate = (str: string, maxLen: number) => {
    return str.length <= maxLen ? str : str.slice(0, maxLen) + '...';
};

const writeLog = (entry: any) => {
    logs.push(entry);

    if (reportOutputs.stdout) {
        console.log(JSON.parse(JSON.stringify(entry)));
    }

    if (reportOutputs.reportsDir) {
        fs.writeFileSync(reportPath, JSON.stringify({ meta, logs }), 'utf-8');
    }
};

const buildLogEntry = (req: IRequest, res: IResponse, tests?: ITests) => {
    const { headers, httpVersion, method, path, body: requestBody } = req;
    const { statusCode, body: responseBody } = res;

    const entry = {
        req: { headers, httpVersion, method, path, body: requestBody },
        res: { statusCode, headers: res.getHeaders(), body: responseBody },
        tests: tests?.listSerializable()
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

    const getFromMockEndpoint = (req: IRequest, res: IResponse) => {
        const $path = req.url.slice(1);

        if (endpointFormat === 'local' && $path.includes('/')) {
            return res
                .status(httpStatus.BadRequest)
                .send('Provider URL must be percent-encoded (cannot contain unescaped forward-slashes)');
        }

        const tests = new Tests(req, res, meta);

        enum TEST_IDS {
            responseCode = '__a__00'
        };

        runTests(tests);

        tests
            .add(TEST_IDS.responseCode, 'Request returns 2XX response code')
            .setFailureState(false); // initialize to success

        const fail = (res: IResponse, code: number, message: string) => {
            tests
                .find(TEST_IDS.responseCode)
                .setFailureState(`Request failed with status ${code}: ${message}`);

            return res
                .status(code)
                .send(message);
        }

        // logging
        res.on('finish', () => {
            const logEntry = buildLogEntry(req, res, tests);
            writeLog(logEntry);
        });

        if (res.headersSent) {
            return;
        }

        if (tests.list().some(test => test.success === false)) {
            const data = {
                failures: tests.listSerializable().filter(test => test.success === false)
            };

            return res
                .status(httpStatus.BadRequest)
                .json(data);
        }

        let url;

        if (endpointFormat === 'local') {
            try {
                url = decodeURIComponent($path);
            } catch {
                return fail(
                    res,
                    httpStatus.BadRequest,
                    `${$path} cannot be percent-decoded`
                );
            }

            try {
                new URL(url);
            } catch {
                return fail(
                    res,
                    httpStatus.BadRequest,
                    `${url} is not a valid URL`
                );
            }
        }

        const fileName = providerPathFileMap[url || $path];

        if (!fileName) {
            return fail(
                res,
                httpStatus.NotFound,
                `URL ${url} must exist as a key in providerPathFileMap in config.ts`
            );
        }

        const filePath = path.join(__dirname, 'responses', fileName);

        if (!fs.existsSync(filePath)) {
            return fail(
                res,
                httpStatus.NotFound,
                `fileName ${fileName} must exist as a file in the responses folder`
            );
        }

        setMimeType(req, res);

        return res.sendFile(filePath);
    };

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
    start
};
