import config from './config';

const { sslCACert } = config;

process.stdout.write(sslCACert || 'null');

process.exit();
