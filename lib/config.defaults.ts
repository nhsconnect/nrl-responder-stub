const defaultConfig: IConfig = {
    endpointFormat: 'local',
    useFhirMimeTypes: true,
    explicitlySetUtf8: true,
    port: 5000,
    
    reportOutputs: {
        reportsDir: true,
    },

    logBodyMaxLength: 1000,

    sslCACert: null,
    sslServerCert: null,
    sslServerKey: null,
    /* sslInsecure: false, */   /*
                                 * SSL mode defaults to true if `sslCACert`,
                                 * `sslServerCert`, and `sslServerKey` are
                                 * provided; this option acts as an override
                                 */
};

export default defaultConfig;
