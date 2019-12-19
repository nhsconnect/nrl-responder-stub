import userConfig from './config.user';
import config from './config.defaults';

Object.entries(userConfig).forEach(([key, val]) => {
    (config as any)[key] = val;
});

export default config;
