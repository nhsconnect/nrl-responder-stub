export {}

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const dirName = path.join(__dirname, 'reports');

const flagIdx = process.argv
    .findIndex(arg => ['-f', '--input-file'].includes(arg)) + 1;

const arg = flagIdx && process.argv[flagIdx];

const fileName: string | undefined = arg || fs.readdirSync(dirName)
    .filter((fileName: string) => fileName.endsWith('.json'))
    .sort()
    .pop();

if (!fileName) {
    process.exit(1);
}

const data: any = JSON.parse(
    fs.readFileSync(path.join(dirName, fileName), 'utf8')
);

const fmtHeaders = (headers: object) => {
    const formattedHeaders: { name: string, value: string }[] = [];
    
    Object.entries(headers).forEach(([$name, value]) => {
        const name = $name.replace(/\b[a-z]/g, match => match.toUpperCase()).replace(/id\b/, 'Id');

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
    req: { headers: object };
    res: { headers: object };
    validations: ISerializableValidation[];
}

const splitNumbers = (str: string) => str.split(/(\d+(?:\.\d+)?)/).map((el, idx) => {
    return idx % 2 ? parseFloat(el) : el;
});

const sortValidations = (a: ISerializableValidation, b: ISerializableValidation) => {
    const [aId, bId] = [a, b].map(validation => validation.validationId);

    const [splitIdA, splitIdB] = [aId, bId].map(splitNumbers);

    while ([splitIdA, splitIdB].every(arr => arr.length)) {
        const [currA, currB] = [splitIdA, splitIdB]
            .map(arr => arr.shift() ?? -Infinity);

        if (currA !== currB) {
            return currA > currB ? 1 : -1;
        }
    }

    return 0;
};

data.logs.forEach((log: ILog) => {
    // TODO

    log.req.headers = fmtHeaders(log.req.headers);
    log.res.headers = fmtHeaders(log.res.headers);

    const [all, passed, failed, notRun] = [
        () => true,
        (validation: ISerializableValidation) => validation.hasRun && validation.success,
        (validation: ISerializableValidation) => validation.hasRun && !validation.success,
        (validation: ISerializableValidation) => !validation.hasRun,
    ].map(filterFn => log.validations.filter(filterFn).sort(sortValidations));

    (log as any).validations = { all, passed, failed, notRun };
});

fs.readFile(path.join(__dirname, 'static/report-template.html'), 'utf-8', (error: any, source: any) => {
    const template = handlebars.compile(source);
    const html = template(data);

    // TODO
    fs.writeFileSync(
        path.join(dirName, 'html', fileName.replace(/\.json$/, '.html')),
        html
    );
});
