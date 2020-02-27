import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import config from './config';

import { responseBodies } from './request-response-extensions';

const reportFileName = `${new Date().toISOString().slice(0, -5).replace(/\D/g, '-')}.json`;
const reportsDir = path.join(__dirname, '..', 'reports');
const reportPath = path.join(reportsDir, reportFileName);

const logs: any[] = [];

const { reportOutputs } = config;

const meta = { config };

const writeLog = (entry: ILogEntry) => {
    logs.push(entry);

    if (reportOutputs.stdout) {
        console.log(JSON.parse(JSON.stringify(entry)));
    }

    if (reportOutputs.reportsDir) {
        fs.writeFileSync(reportPath, JSON.stringify({ meta, logs }), 'utf-8');
    }
};

const buildLogEntry = (request: Request, response: Response, validations?: IValidations) => {
    const { headers, httpVersion, method, path, body: requestBody } = request;
    const { statusCode } = response;

    const responseBody = responseBodies.get(response);

    const entry: ILogEntry = {
        request: { headers, httpVersion, method, path, body: requestBody },
        response: { statusCode, headers: response.getHeaders(), body: responseBody },
        validations: validations?.listSerializable()
    };

    if (method === 'GET') delete entry.request.body;

    return entry;
};

export {
    writeLog,
    buildLogEntry,
    logs,
    reportFileName,
    reportsDir,
    reportPath,
    meta,
};