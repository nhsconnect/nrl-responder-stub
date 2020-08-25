const checkSecureMode = (config: Config) => Boolean(
    !config.sslInsecure
        && config.sslCACert
        && config.sslServerKey
        && config.sslServerCert
);

export default checkSecureMode;
