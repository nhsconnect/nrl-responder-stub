import fs from 'fs';
import path from 'path';

import config from './config';
import parseTsv from './parse-tsv';

const { environment } = config;

const apiDirName = 'from-api';
export const apiDirPath = path.join(__dirname, '..', 'responses', apiDirName);

const formatDateTime = (dateTime: Date) =>
    `${dateTime.toISOString().replace(/[:-]/g, '_')}_`;

const DATE_TIME_FORMATTED_LENGTH = formatDateTime(new Date()).length;

type B64 = string & {
    readonly IsBase64: unique symbol;
};

const b64UrlSafe = {
    decode: (b64: B64) =>
        Buffer.from(
            b64.replace(/-/g, '+').replace(/_/g, '/'),
            'base64',
        ).toString('utf8'),

    encode: (str: string) =>
        Buffer.from(str, 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_'),
};

export const filePathToEndpoint = (filePath: string) => {
    return b64UrlSafe.decode(
        filePath
            .replace(`${apiDirPath}${path.sep}`, '')
            .slice(DATE_TIME_FORMATTED_LENGTH) as B64,
    );
};

export const endpointToFileName = (endpoint: string, dateTime: Date) =>
    `${formatDateTime(dateTime)}${b64UrlSafe.encode(endpoint)}`;

export const endpointToFilePath = (endpoint: string, dateTime: Date) => {
    return path.join(apiDirPath, endpointToFileName(endpoint, dateTime));
};

export const fileEndpointMapping = parseTsv(
    fs.readFileSync(
        path.join(__dirname, '../file-endpoint-mapping.tsv'),
        'utf8',
    ),
);

export const addToFileEndpointMapping = (fileName: string) => {
    const file = path.join(apiDirName, fileName);

    const endpoint = b64UrlSafe.decode(
        fileName.slice(DATE_TIME_FORMATTED_LENGTH) as B64,
    );

    fileEndpointMapping.push({
        endpoint,
        file,
    });
};

export const deleteFromFileEndpointMapping = (endpoint: string) => {
    const idx = fileEndpointMapping.findIndex(row => row.endpoint === endpoint);

    const row = fileEndpointMapping[idx];

    if (idx !== -1) {
        fs.unlinkSync(path.join(__dirname, '..', 'responses', row.file));

        fileEndpointMapping.splice(idx, 1);

        return true;
    }

    return false;
};

fileEndpointMapping.forEach(row => {
    if (environment === 'integration') {
        row.endpoint = new URL(row.endpoint).pathname;
    }
});

if (fs.existsSync(apiDirPath)) {
    const fileNames = fs.readdirSync(apiDirPath);

    fileNames.forEach(addToFileEndpointMapping);
}
