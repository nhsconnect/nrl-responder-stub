import config from './config';

const { pathFileMapping, endpointFormat } = config;

const getSuccessEndpointForFileExt = (ext: string) => {
    const endpoint = Object.keys(pathFileMapping)
        .find(key => pathFileMapping[key].endsWith(`.${ext}`));

    if (!endpoint) {
        throw new TypeError(`config.pathFileMapping must contain an endpoint for ${ext} filetype`);
    }

    return endpointFormat === 'local' ? encodeURIComponent(endpoint) : endpoint;
};

const guidedTestPlan: ITestCase[] = [
    {
        name: 'PDF retrieval',
        endpoint: getSuccessEndpointForFileExt('pdf'),
        expect: {
            responseCode: 200,
            validations: true, // all
        },
    },
    {
        name: 'JSON retrieval',
        endpoint: getSuccessEndpointForFileExt('json'),
        expect: {
            responseCode: 200,
            validations: ['1', '2']
        },
    },
    {
        name: 'Not found',
        endpoint: 'INVALID_ENDPOINT',
        expect: {
            responseCode: 400,
            validations: [], // none
        },
    },
    // {
    //     name: 'JSON retrieval',
    //     endpoint: '',
    //     expect: {
    //         responseCode: 200,
    //         validations: true,
    //     },
    // },
    // {
    //     name: 'XML retrieval',
    //     endpoint: '',
    //     expect: {
    //         responseCode: 200,
    //         validations: true,
    //     },
    // },
    // {
    //     name: 'HTML retrieval',
    //     endpoint: '',
    //     expect: {
    //         responseCode: 200,
    //         validations: true,
    //     },
    // },
];

export default guidedTestPlan;
