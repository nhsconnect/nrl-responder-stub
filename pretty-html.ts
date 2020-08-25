/**
 * Converts reports from JSON => pretty-printed HTML
 *
 * HTML is generated using handlebars, based on the
 * `static/report-template.html` template.
 *
 * If -f or --input-file argument passed, selects file from `reports` dir based
 * on that filename.
 *
 * Else, selects the most recent JSON report (based on ISO-formatted dates in
 * filenames).
 */

import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import checkSecureMode from './lib/check-secure-mode';

const baseDirName = path.join(__dirname, 'reports');

const htmlDirName = path.join(baseDirName, 'html');

if (!fs.existsSync(htmlDirName)) {
    fs.mkdirSync(htmlDirName, { recursive: true });
}

const flagIdx =
    process.argv.findIndex(arg => ['-f', '--input-file'].includes(arg)) + 1;
// index is -1 if not found; adding 1 yields 0 if not found, else the next arg

const arg = flagIdx && process.argv[flagIdx]; // short-circuits if 0

const fileName: string | undefined =
    arg ||
    fs
        .readdirSync(baseDirName) // 0 is falsy
        .filter((fileName: string) => fileName.endsWith('.json'))
        .sort()
        .pop();

if (!fileName) {
    process.exit(1);
}

const data: any = JSON.parse(
    fs.readFileSync(path.join(baseDirName, fileName), 'utf8'),
);

const formatHeaders = (headers: object) => {
    const formattedHeaders: { name: string; value: string }[] = [];

    Object.entries(headers).forEach(([$name, value]) => {
        const name = $name
            .replace(/\b[a-z]/g, match => match.toUpperCase())
            .replace(/id\b/, 'Id');

        formattedHeaders.push({ name, value });
    });

    return formattedHeaders;
};

interface ISerializableValidation {
    validationId: string;
    description: string;
    hasRun: boolean;
    success?: boolean;
    details?: string;
}

interface ILog {
    request: { headers: object };
    response: { headers: object };
    validations: ISerializableValidation[];
}

const splitNumbers = (str: string) =>
    str.split(/(\d+(?:\.\d+)?)/).map((el, idx) => {
        return idx % 2 ? parseFloat(el) : el;
    });

const sortValidations = (
    validationA: ISerializableValidation,
    validationB: ISerializableValidation,
) => {
    // sort validations by name in lexicographical order (e.g. A9, A10, B1, B2...)
    const [idA, idB] = [validationA, validationB].map(
        validation => validation.validationId,
    );

    const [splitIdA, splitIdB] = [idA, idB].map(splitNumbers);

    while ([splitIdA, splitIdB].every(arr => arr.length)) {
        const [currentA, currentB] = [splitIdA, splitIdB].map(
            arr => arr.shift() ?? -Infinity,
        );

        if (currentA !== currentB) {
            return currentA > currentB ? 1 : -1;
        }
    }

    return 0;
};

data.meta.secureMode = checkSecureMode(data.meta.config);

data.metaJson = JSON.stringify(data.meta, null, 4);

data.logs.forEach((log: ILog) => {
    log.request.headers = formatHeaders(log.request.headers);
    log.response.headers = formatHeaders(log.response.headers);

    const [all, passed, failed, notRun] = [
        () => true,
        (validation: ISerializableValidation) =>
            validation.hasRun && validation.success,
        (validation: ISerializableValidation) =>
            validation.hasRun && !validation.success,
        (validation: ISerializableValidation) => !validation.hasRun,
    ].map(filterFn => log.validations.filter(filterFn).sort(sortValidations));

    (log as any).validations = { all, passed, failed, notRun };
});

fs.readFile(
    path.join(__dirname, 'lib', 'static/report-template.html'),
    'utf-8',
    (error: any, source: any) => {
        const template = handlebars.compile(source);
        const html = template(data);

        fs.writeFileSync(
            path.join(htmlDirName, fileName.replace(/\.json$/, '.html')),
            html,
        );
    },
);
