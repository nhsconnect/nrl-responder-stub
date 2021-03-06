/**
 * Runs validations on required headers/header formats
 * 
 * Parsing and validation of the JWT in the `Authorization` header is delegated to
 * `./validate-jwt`.
 */

import validateJwt from './validate-jwt';
import { isUuid, isAsid } from './pattern-matchers';
import Validations from './validations';

const VALIDATION_IDS = {
    missingHeaders: 'missing-headers',
    interactionID: 'interaction-id',
    traceId: 'trace-id',
    asidHeaders: 'asid-headers',
    authHeader: 'auth-header',
};

export default (validations: Validations) => {
    // Ssp-TraceID  	    Consumer’s TraceID (i.e. GUID/UUID)
    // Ssp-From	            Consumer’s ASID
    // Ssp-To       	    Provider’s ASID
    // Ssp-InteractionID	Spine’s InteractionID.
    //                      The interaction ID for retrieving a record referenced in an NRL pointer is specific to the NRL service and is as follows:
    //                      urn:nhs:names:services:nrl:DocumentReference.content.read

    const requiredHeaders = [ 'Ssp-TraceID', 'Ssp-From', 'Ssp-To', 'Ssp-InteractionID', 'Authorization' ];
    const asidHeaders = [ 'Ssp-From', 'Ssp-To' ];
    const interactionIdCorrectVal = 'urn:nhs:names:services:nrl:DocumentReference.content.read';

    validations.add(VALIDATION_IDS.missingHeaders, `Headers [ ${requiredHeaders.join(', ')} ] must all be present`);
    validations.add(VALIDATION_IDS.interactionID, `The Ssp-InteractionID header must have the value "${interactionIdCorrectVal}"`);
    validations.add(VALIDATION_IDS.traceId, 'The Ssp-TraceID header must be a UUID in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (where each x is a hex digit)');
    validations.add(VALIDATION_IDS.asidHeaders, `Headers [ ${asidHeaders.join(', ')} ] must be ASIDs consisting of 12 digits`);
    validations.add(VALIDATION_IDS.authHeader, 'The Authorization header must start with "Bearer "');

    const { request } = validations;

    const { headers } = request;

    const missingHeaders = requiredHeaders.filter(h => !headers[h.toLowerCase()]);

    validations.find(VALIDATION_IDS.missingHeaders)
        .setFailureState(
            missingHeaders.length
            &&
            `The following required headers are missing or empty: [ ${missingHeaders.join(', ')} ]`
        );

    validations.find(VALIDATION_IDS.interactionID)
        .setFailureState(
            headers['ssp-interactionid'] !== interactionIdCorrectVal
            &&
            `The Ssp-InteractionID header has the value ${JSON.stringify(headers['ssp-interactionid'])}`
        );

    validations.find(VALIDATION_IDS.traceId)
        .setFailureState(
            !isUuid(typeof headers['ssp-traceid'] === 'string' ? headers['ssp-traceid']  : '')
            &&
            `The Ssp-TraceID header has the value ${JSON.stringify(headers['ssp-traceid'])}`
        );

    const incorrectAsidHeaders = asidHeaders.filter(h => {
        const header = headers[h.toLowerCase()];

        return !isAsid(typeof header === 'string' ? header : '');
    });

    validations.find(VALIDATION_IDS.asidHeaders)
        .setFailureState(
            incorrectAsidHeaders.length
            &&
            `The [ ${incorrectAsidHeaders.join(', ')} ] headers are not ASIDs consisting of 12 digits`
        );

    const authHeader = typeof headers.authorization === 'string' ? headers.authorization : '';

    validations.find(VALIDATION_IDS.authHeader)
        .setFailureState(
            !authHeader.startsWith('Bearer ')
            &&
            `The Authorization header does not start with "Bearer "`
        );

    validateJwt(validations, authHeader.replace(/^Bearer /, ''));
};
