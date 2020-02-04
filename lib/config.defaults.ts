const defaultConfig: IConfig = {
    endpointFormat: 'local',
    useFhirMimeTypes: true,
    explicitlySetUtf8: true,
    port: 5000,
    
    reportOutputs: {
        reportsDir: true,
    },

    logBodyMaxLength: 1000,

    pathFileMapping: {
        'https://provider1.example.com/api/patients/1/records/sample.json': 'immunization-example.json',
        'https://provider1.example.com/api/patients/1/records/sample.xml': 'immunization-example.xml',
        'https://provider1.example.com/api/patients/1/records/sample.html': 'sample.html',
        'https://provider1.example.com/api/patients/1/records/sample.pdf': 'sample.pdf',
    },

    sslCACert: null,
    sslServerCert: null,
    sslServerKey: null,
    // secureMode: undefined, // will default to true if `sslCACert`, `sslServerCert`, and `sslServerKey` are provided, unless set explicitly
};

export default defaultConfig;
