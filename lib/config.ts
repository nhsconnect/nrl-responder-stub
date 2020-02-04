import userConfig from '../config.user';
import config from './config.defaults';

Object.entries(userConfig).forEach(([key, val]) => {
    (config as any)[key] = val;
});

if (typeof config.secureMode === 'undefined') {
    config.secureMode = !!(config.sslCACert && config.sslServerKey && config.sslServerCert);
}

export default config;
