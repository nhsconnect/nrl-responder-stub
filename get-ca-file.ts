import config from './src/config';

const { sslCACert } = config;

process.stdout.write(sslCACert || 'null');

process.exit();
