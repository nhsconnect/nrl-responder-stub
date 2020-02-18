const checkSecureMode = (config: IConfig) => Boolean(
    !config.sslInsecure
        && config.sslCACert
        && config.sslServerKey
        && config.sslServerCert
);

export default checkSecureMode;
