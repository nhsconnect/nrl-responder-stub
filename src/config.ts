const config: IConfig = {
    mode: 'guided',
    endpointFormat: 'local',
    useFhirMimeTypes: true,
    port: 5000,
    reportOutputs: {
        reportsDir: true,
    },

    suppressedTestIds: [],

    logBodyMaxLength: 1000,

    providerPathFileMap: {
        'https://provider1.example.com/api/patients/1/records/sample.json': 'immunization-example.json',
        'https://provider1.example.com/api/patients/1/records/sample.xml': 'immunization-example.xml',
        'https://provider1.example.com/api/patients/1/records/sample.html': 'sample.html',
        'https://provider1.example.com/api/patients/1/records/sample.pdf': 'sample.pdf',
    }
};

export default config;
