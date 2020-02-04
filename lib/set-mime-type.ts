import config from './config';

const { useFhirMimeTypes, explicitlySetUtf8 } = config;

const FILE_FORMATS: IStringMap<IFileFormat> = {
    json: {
        extension: 'json',
        baseMimeType: 'application/json',
        fhirMimeType: 'application/fhir+json',
    },
    xml: {
        extension: 'xml',
        baseMimeType: 'application/xml',
        fhirMimeType: 'application/fhir+xml',
    }
};

export default (request: IRequest, response: IResponse) => {
    const extension = request.url.match(/\.(\w+)$/)?.[1]; // percent-encoding doesn't affect "."

    const fileFormat = extension && FILE_FORMATS[extension];

    if (fileFormat) {
        let contentType = fileFormat[useFhirMimeTypes ? 'fhirMimeType' : 'baseMimeType'];

        if (explicitlySetUtf8) {
            contentType += ';charset=utf-8';
        }

        response.type(contentType);
    }
};
