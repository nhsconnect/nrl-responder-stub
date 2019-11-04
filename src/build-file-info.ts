import httpStatus from './http-status';

const providerData: IProviderData = require('./static/provider-data.json');

const FILE_FORMATS: IFileFormats = {
    json: {
        extension: 'json',
        mimeType: 'application/fhir+json',
        encoding: 'utf-8'
    },
    xml: {
        extension: 'xml',
        mimeType: 'application/fhir+xml',
        encoding: 'utf-8'
    },
    pdf: {
        extension: 'pdf',
        mimeType: 'application/pdf',
        encoding: 'binary'
    },
    html: {
        extension: 'html',
        mimeType: 'text/html',
        encoding: 'utf-8'
    }
};

export default (req: IRequest, res: IResponse) => {
    let url: URL;

    try {
        url = new URL(req.params.url); // automatically percent-decoded in `params` object
    } catch {
        return res
            .status(httpStatus.badRequest)
            .send('Provider URL could not be parsed');
    }

    const provider = providerData.providers[url.origin];

    if (!provider) {
        return res
            .status(httpStatus.badRequest)
            .send('Invalid provider URL origin');
    }

    // format /api/patients/<patientId>/records/<recordId>.json
    const matches = url.pathname.match(
        new RegExp('^/api/patients/(.+?)/records/(.+?)\\.(.+)$')
    );

    if (!matches) {
        return res
            .status(httpStatus.badRequest)
            .send('Provider URL pathname is incorrectly constructed');
    }

    const [patientId, recordId, extension] = (matches as string[]).slice(1);

    const patient = provider.patients[patientId];

    if (!patient) {
        return res
            .status(httpStatus.notFound)
            .send('Invalid patient ID');
    }

    const record = patient.records[recordId];

    if (!record) {
        return res
            .status(httpStatus.notFound)
            .send('Invalid record ID');
    }

    if (!record.availableFormats.includes(extension)) {
        return res
            .status(httpStatus.badRequest)
            .send(`Invalid file extension for this record. Available extensions: ${record.availableFormats.join(', ')}`);
    }

    const fileFormat = FILE_FORMATS[extension];

    if (!fileFormat) {
        return res
            .status(httpStatus.badRequest)
            .send('Unrecognised MIME type');
    }

    return {
        fileInfo: { patient, record, fileFormat }
    };
};