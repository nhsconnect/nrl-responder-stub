const { useFhirMimeTypes } = require('./config.json');

const FILE_FORMATS: IStringMap<IFileFormat> = {
    json: {
        extension: 'json',
        mimeType: 'application/fhir+json'
    },
    xml: {
        extension: 'xml',
        mimeType: 'application/fhir+xml'
    }
};

export default (tcs: ITestCases) => {
    if (useFhirMimeTypes !== false) {
        const { req, res } = tcs;
        const extension = req.params.url.match(/\.(\w+)$/)?.[1];

        const fileFormat = extension && FILE_FORMATS[extension];

        if (fileFormat) {
            res.type(fileFormat.mimeType)
        }
    }
};
