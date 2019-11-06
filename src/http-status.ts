import http from 'http';

/**
* reverse lookup (name => code, as opposed to code => name
* as in `http.STATUS_CODES`)
*/

const httpStatus: IHttpStatusMap = {};

Object.entries(http.STATUS_CODES).forEach(([statusCode, message]) => {
    if (message) {
        httpStatus[message.replace(/[^a-z]/gi, '')] = +statusCode;
    }
});

export default httpStatus;
