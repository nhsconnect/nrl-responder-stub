const userConfig: IConfigOverrides = {
    // mode: 'guided',
    // endpointFormat: 'integration',
    // useFhirMimeTypes: true,
    // explicitlySetUtf8: true,
    // port: 5000,

    // reportOutputs: {
    //     // reportsDir: true,
    //     // stdout: true,
    // },

    // logBodyMaxLength: 1000,

    // pathFileMapping: {
    //     'api/patients/1/records/sample.json': 'immunization-example.json',
    //     'api/patients/1/records/sample.xml': 'immunization-example.xml',
    //     'api/patients/1/records/sample.html': 'sample.html',
    //     'api/patients/1/records/sample.pdf': 'sample.pdf',
    // },

    sslCACert: 'C:/certs/server_cert.pem',
    sslServerCert: 'C:/certs/server_cert.pem',
    sslServerKey: 'C:/certs/server_key.pem',
    // secureMode: false,
};

export default userConfig;
