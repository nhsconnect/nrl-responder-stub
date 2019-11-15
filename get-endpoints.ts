const { testServerPort, providerUrlFileMap } = require('./src/config.json');

const port = testServerPort || 5000;

const constructEndpoint = (url: string) => `/${encodeURIComponent(url)}`;

const urls = Object.keys(providerUrlFileMap);

const endpoints = urls.map(url => `http://localhost:${port}${constructEndpoint(url)}`);

console.log(endpoints);
