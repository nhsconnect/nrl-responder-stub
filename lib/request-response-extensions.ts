import { Response } from 'express';

const responseBodies = new WeakMap<Response, string>();

export {
    responseBodies,
};
