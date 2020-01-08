import fs from 'fs';
import path from 'path';

import runValidations from './run-validations';
import Validations from './validations';
import setMimeType from './set-mime-type';

import { globalId } from './ids';

import httpStatus from './http-status';
import config from './config';

import { meta, buildLogEntry, writeLog } from './logs';

const {
    pathFileMapping,
    endpointFormat,
} = config;

const VALIDATION_IDS = {
    responseCode: `${globalId()}`
};

const getFromMockEndpoint = (req: IRequest, res: IResponse, next: INextFunction) => {
    const $path = req.url.slice(1);

    if (endpointFormat === 'local' && $path.includes('/')) {
        res
            .status(httpStatus.BadRequest)
            .send('Provider URL must be percent-encoded (cannot contain unescaped forward-slashes)');
        
        return next();
    }

    const validations = new Validations(req, res, meta);

    runValidations(validations);

    validations
        .add(VALIDATION_IDS.responseCode, 'Request returns 2XX response code')
        .setFailureState(false); // initialize to success

    const fail = (res: IResponse, code: number, message: any) => {
        validations
            .find(VALIDATION_IDS.responseCode)
            .setFailureState(`Request failed with status ${code}: ${JSON.stringify(message)}`);

        res
            .status(code)
            .send(message);

        return next();
    }

    // logging
    res.on('finish', () => {
        const logEntry = buildLogEntry(req, res, validations);
        writeLog(logEntry);
    });

    if (res.headersSent) {
        return next();
    }

    if (validations.list().some(validation => validation.success === false)) {
        const data = {
            failures: validations.listSerializable().filter(validation => validation.success === false)
        };

        return fail(
            res,
            httpStatus.BadRequest,
            data
        );
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

    const urlOrPath = url || $path;

    const fileName = pathFileMapping[urlOrPath];

    if (!fileName) {
        return fail(
            res,
            httpStatus.NotFound,
            `A filename corresponding to path ${urlOrPath} must exist in pathFileMapping in configuration`
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

    return res.sendFile(filePath, next); // next fn must be in callback - see https://stackoverflow.com/a/33767854
};

export default getFromMockEndpoint;
