import fs from 'fs';
import path from 'path';

import runValidations from './run-validations';
import Validations from './validations';
import setMimeType from './set-mime-type';

import { globalId } from './ids';

import httpStatus from './http-status';
import config from './config';

import { meta, buildLogEntry, writeLog } from './logs';
import { NextFunction } from 'express';

const {
    pathFileMapping,
    endpointFormat,
} = config;

const getFromMockEndpoint = (req: IRequest, res: IResponse, next: NextFunction) => {
    const $path = req.url.slice(1);

    if (endpointFormat === 'local' && $path.includes('/')) {
        res
            .status(httpStatus.BadRequest)
            .send('Provider URL must be percent-encoded (cannot contain unescaped forward-slashes)');
        
        return next();
    }

    const VALIDATION_IDS = {
        responseCode: `${globalId()}`
    };

    const validations = new Validations(req, res, meta);

    runValidations(validations);

    validations
        .add(VALIDATION_IDS.responseCode, 'Request returns 2XX response code')
        .setFailureState(false); // initialize to success

    const fail = (res: IResponse, code: number, message: string) => {
        validations
            .find(VALIDATION_IDS.responseCode)
            .setFailureState(`Request failed with status ${code}: ${message}`);

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

        res
            .status(httpStatus.BadRequest)
            .json(data);

        return next();
    }

    let url;

    if (endpointFormat === 'local') {
        try {
            url = decodeURIComponent($path);
        } catch {
            fail(
                res,
                httpStatus.BadRequest,
                `${$path} cannot be percent-decoded`
            );

            return next();
        }

        try {
            new URL(url);
        } catch {
            fail(
                res,
                httpStatus.BadRequest,
                `${url} is not a valid URL`
            );

            return next();
        }
    }

    const urlOrPath = url || $path;

    const fileName = pathFileMapping[urlOrPath];

    if (!fileName) {
        fail(
            res,
            httpStatus.NotFound,
            `A filename corresponding to path ${urlOrPath} must exist in pathFileMapping in configuration`
        );

        return next();
    }

    const filePath = path.join(__dirname, 'responses', fileName);

    if (!fs.existsSync(filePath)) {
        fail(
            res,
            httpStatus.NotFound,
            `fileName ${fileName} must exist as a file in the responses folder`
        );

        return next();
    }

    setMimeType(req, res);

    res.sendFile(filePath);

    return next();
};

export default getFromMockEndpoint;