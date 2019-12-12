import config from './config';

const { useFhirMimeTypes } = config;

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

export default (req: IRequest, res: IResponse) => {
    if (useFhirMimeTypes !== false) {
        const extension = req.url.match(/\.(\w+)$/)?.[1]; // percent-encoding doesn't affect "."

        const fileFormat = extension && FILE_FORMATS[extension];

        if (fileFormat) {
            res.type(fileFormat.mimeType)
        }
    }
};
