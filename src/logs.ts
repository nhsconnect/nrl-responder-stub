import fs from 'fs';
import path from 'path';

import config from './config';

const reportFileName = `${new Date().toISOString().slice(0, -5).replace(/\D/g, '-')}.json`;
const reportsDir = path.join(__dirname, 'reports');
const reportPath = path.join(reportsDir, reportFileName);

const logs: any[] = [];

import guidedTestPlan from './guided-test-plan';

const {
    reportOutputs,
} = config;

const meta = { config };

if (config.mode === 'guided') {
    (meta as any).guidedTestPlan = guidedTestPlan;
}

const writeLog = (entry: ILogEntry) => {
    logs.push(entry);

    if (reportOutputs.stdout) {
        console.log(JSON.parse(JSON.stringify(entry)));
    }

    if (reportOutputs.reportsDir) {
        fs.writeFileSync(reportPath, JSON.stringify({ meta, logs }), 'utf-8');
    }
};

const buildLogEntry = (req: IRequest, res: IResponse, validations?: IValidations) => {
    const { headers, httpVersion, method, path, body: requestBody } = req;
    const { statusCode, body: responseBody } = res;

    const entry: ILogEntry = {
        req: { headers, httpVersion, method, path, body: requestBody },
        res: { statusCode, headers: res.getHeaders(), body: responseBody },
        validations: validations?.listSerializable()
    };

    if (method === 'GET') delete entry.req.body;

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