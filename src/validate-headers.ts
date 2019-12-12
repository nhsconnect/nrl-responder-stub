import validateJwt from './validate-jwt';
import { uuidMatcher, asidMatcher } from './pattern-matchers';

enum TEST_IDS {
    missingHeaders = '__h__1',
    interactionID = '__h__2',
    traceId = '__h__3',
    asidHeaders = '__h__4',
    authHeader = '__h__5'
};

export default (tests: ITests) => {
    // Ssp-TraceID  	    Consumer’s TraceID (i.e. GUID/UUID)
    // Ssp-From	            Consumer’s ASID
    // Ssp-To       	    Provider’s ASID
    // Ssp-InteractionID	Spine’s InteractionID.
    //                      The interaction ID for retrieving a record referenced in an NRL pointer is specific to the NRL service and is as follows:
    //                      urn:nhs:names:services:nrl:DocumentReference.content.read

    const requiredHeaders = [ 'Ssp-TraceID', 'Ssp-From', 'Ssp-To', 'Ssp-InteractionID', 'Authorization' ];
    const asidHeaders = [ 'Ssp-From', 'Ssp-To' ];
    const interactionIdCorrectVal = 'urn:nhs:names:services:nrl:DocumentReference.content.read';

    tests.add(TEST_IDS.missingHeaders, `Headers [ ${requiredHeaders.join(', ')} ] must all be present`);
    tests.add(TEST_IDS.interactionID, `The Ssp-InteractionID header must have the value "${interactionIdCorrectVal}"`);
    tests.add(TEST_IDS.traceId, 'The Ssp-TraceID header must be a UUID in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (where each x is a hex digit)');
    tests.add(TEST_IDS.asidHeaders, `Headers [ ${asidHeaders.join(', ')} ] must be ASIDs consisting of 12 digits`);
    tests.add(TEST_IDS.authHeader, 'The Authorization header must start with "Bearer "');

    const { req } = tests;

    const { headers } = req;

    const missingHeaders = requiredHeaders.filter(h => !headers[h.toLowerCase()]);

    tests.find(TEST_IDS.missingHeaders)
        .setFailureState(
            missingHeaders.length
            &&
            `The following required headers are missing or empty: [ ${missingHeaders.join(', ')} ]`
        );

    tests.find(TEST_IDS.interactionID)
        .setFailureState(
            headers['ssp-interactionid'] !== interactionIdCorrectVal
            &&
            `The Ssp-InteractionID header has the value ${JSON.stringify(headers['ssp-interactionid'])}`
        );

    tests.find(TEST_IDS.traceId)
        .setFailureState(
            !uuidMatcher.test(typeof headers['ssp-traceid'] === 'string' ? headers['ssp-traceid']  : '')
            &&
            `The Ssp-TraceID header has the value ${JSON.stringify(headers['ssp-traceid'])}`
        );

    const incorrectAsidHeaders = asidHeaders.filter(h => {
        const header = headers[h.toLowerCase()];

        return !asidMatcher.test(typeof header === 'string' ? header : '');
    });

    tests.find(TEST_IDS.asidHeaders)
        .setFailureState(
            incorrectAsidHeaders.length
            &&
            `The [ ${incorrectAsidHeaders.join(', ')} ] headers are not ASIDs consisting of 12 digits`
        );

    const authHeader = typeof headers.authorization === 'string' ? headers.authorization : '';

    tests.find(TEST_IDS.authHeader)
        .setFailureState(
            !authHeader.startsWith('Bearer ')
            &&
            `The Authorization header does not start with "Bearer "`
        );

    validateJwt(tests, authHeader.replace(/^Bearer /, ''));
};
