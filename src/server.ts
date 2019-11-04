import express from 'express';
import chalk from 'chalk';
import path from 'path';
import httpStatus from './http-status';
import handleRetrievalRequest from './handle-retrieval-request';
import getUrls from './get-urls';
import morgan from 'morgan';

const config = require('./config.json');
const providerData: IProviderData = require('./static/provider-data.json');

const { testServerPort } = config;
const port = testServerPort || 5000;

const app = express();

const constructEndpoint = (url: string) => `/${encodeURIComponent(url)}`;

const start = () => {
    const urls = getUrls(providerData);

    const endpoints = urls.map(url => `http://localhost:${port}${constructEndpoint(url)}`);

    app.use((req, res, next) => {
        const { headers, httpVersion, method, url, path } = req;

        if (!['/', '/urls', '/favicon.ico', '/endpoints'].includes(path)) {
            console.log({ headers, httpVersion, method, url });
        }

        next();
    });

    // app.use(morgan((tokens, req, res) => { // logging
    //     return [
    //         tokens.method(req, res),
    //         tokens.url(req, res),
    //         tokens.status(req, res),
    //         tokens.res(req, res, 'content-length'),
    //         '-',
    //         tokens['response-time'](req, res), 'ms'
    //     ].join(' ')
    // }, {
    // skip: (req, res) => {
    //     return ['/', '/urls', '/favicon.ico', '/endpoints']
    //         .includes(req.path);
    // }
    // }));

    // app.use(morgan('combined', {
    //     skip: (req, res) => {
    //         return [ '/', '/urls', '/favicon.ico', '/endpoints' ]
    //             .includes(req.path);
    //     }
    // }));

    // prevent unnecessary console errors
    app.get('/favicon.ico', (_req, res) => res.sendStatus(httpStatus.noContent));

    app.get('/', (_req, res) => {
        // generated from src/README.md during build
        return res.sendFile(path.join(__dirname, 'README.html'));
    });

    app.get('/urls', (_req, res) => {
        return res.json({ urls });
    });

    app.get('/endpoints', (_req, res) => { // TODO - for testing
        return res.json({ endpoints });
    });

    app.get('/:url', handleRetrievalRequest);

    app.get('*', (_req, res) => {
        return res
            .status(httpStatus.badRequest)
            .send('Provider URL must be percent-encoded (cannot contain unescaped forward-slashes)');
    });

    app.listen(port, () => {
        console.log(chalk.cyan(`App running at ${chalk.underline(`http://localhost:${port}`)}`));

        console.log(`Press ${chalk.cyan.bold('Ctrl + C')} to stop server`);
    });
};

export default {
    start
};
