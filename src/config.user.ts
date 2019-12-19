const userConfig: IConfigOverrides = {
    mode: 'guided',

    endpointFormat: 'integration',
    reportOutputs: {
        // stdout: true,
    },

    pathFileMapping: {
        'api/patients/1/records/sample.json': 'immunization-example.json',
        'api/patients/1/records/sample.xml': 'immunization-example.xml',
        'api/patients/1/records/sample.html': 'sample.html',
        'api/patients/1/records/sample.pdf': 'sample.pdf',
    },
};

export default userConfig;
