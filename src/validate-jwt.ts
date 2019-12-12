import jwt from 'jsonwebtoken';
import { requestingSystemMatcher, requestingOrganizationMatcher } from './pattern-matchers';

const TOLERANCE_SECONDS = 30;

enum TEST_IDS {
    parseJwt = '__j__1',
    missingClaims = '__j__2',
    issuedInFuture = '__j__3',
    expiryOver5Mins = '__j__4',
    issuedAfterExpiry = '__j__5',
    subNotRequestingUser = '__j__6',
    // subNotRequestingSystem = '__j__7',
    reasonForRequest = '__j__8',
    scope = '__j__9',
    requestingSystemFormat = '__j__10',
    requestingOrganizationFormat = '__j__11'
};

export default (tests: ITests, token: string) => {
    const mandatoryClaims = ['iss', 'sub', 'aud', 'exp', 'iat', 'reason_for_request', 'scope', 'requesting_system', 'requesting_organization', 'requesting_user'];

    tests.add(TEST_IDS.parseJwt, 'JWT must be parsable');
    tests.add(TEST_IDS.missingClaims, `The following mandatory JWT claims must all be present: [ ${mandatoryClaims.join(', ')} ]`);
    tests.add(TEST_IDS.issuedInFuture, 'The JWT iat (issued at) claim cannot be in the future');
    tests.add(TEST_IDS.expiryOver5Mins, 'The JWT exp (expiration time) claim cannot be more than 5 minutes in the future');
    tests.add(TEST_IDS.issuedAfterExpiry, 'The JWT iat (issued at) time cannot be after the exp (expiration time) time');
    tests.add(TEST_IDS.subNotRequestingUser, 'The JWT sub (subject) claim must be the same as the requesting_user');
    // tests.add(TEST_IDS.subNotRequestingSystem, 'If requesting_user is absent, the JWT sub (subject) claim must be the same as the requesting_system');
    tests.add(TEST_IDS.reasonForRequest, 'The JWT reason_for_request claim must be set to "directcare"');
    tests.add(TEST_IDS.scope, 'The JWT scope claim must be set to "patient/*.read"');
    tests.add(TEST_IDS.requestingSystemFormat, 'The JWT requesting_system claim must be in the format https://fhir.nhs.uk/Id/accredited-system|[ASID]');
    tests.add(TEST_IDS.requestingOrganizationFormat, 'The JWT requesting_organization claim must be in the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]');

    jwt.verify(token, '', (err, decoded: any) => {
        tests.find(TEST_IDS.parseJwt)
            .setFailureState(
                err
                &&
                `JWT parsing error: ${JSON.stringify(err)}`
            );

        if (!err) {
            const missingClaims = mandatoryClaims.filter(c => !decoded[c]);

            tests.find(TEST_IDS.missingClaims)
                .setFailureState(
                    missingClaims.length
                    &&
                    `The following mandatory JWT claims are missing or empty: [ ${missingClaims.join(', ')} ]`
                );

            const {
                iat,
                exp,
                sub,
                reason_for_request,
                scope,
                requesting_system,
                requesting_organization,
                requesting_user
            } = decoded;

            const now = Math.floor(Date.now() / 1000);
            const in5Minutes = now + 5 * 60;

            tests.find(TEST_IDS.issuedInFuture)
                .setFailureState(
                    iat > now + TOLERANCE_SECONDS
                    &&
                    'The JWT iat (issued at) claim is in the future'
                );

            tests.find(TEST_IDS.expiryOver5Mins)
                .setFailureState(
                    exp > in5Minutes + TOLERANCE_SECONDS
                    &&
                    'The JWT exp (expiration time) claim is more than 5 minutes in the future'
                );

            tests.find(TEST_IDS.issuedAfterExpiry)
                .setFailureState(
                    iat > exp
                    &&
                    'The JWT iat (issued at) time is after the exp (expiration time) time'
                );

            tests.find(TEST_IDS.subNotRequestingUser)
                .setFailureState(
                    sub !== requesting_user
                    &&
                    'The sub (subject) claim is different from requesting_user'
                );

            // tests.find(TEST_IDS.subNotRequestingSystem)
            //     .setFailureState(
            //         !requesting_user && (sub !== requesting_system)
            //         &&
            //         'JWT requesting_user is absent and sub (subject) claim is different from requesting_system'
            //     );

            tests.find(TEST_IDS.reasonForRequest)
                .setFailureState(
                    reason_for_request !== 'directcare'
                    &&
                    'The JWT reason_for_request claim is not set to "directcare"'
                );

            tests.find(TEST_IDS.scope)
                .setFailureState(
                    scope !== 'patient/*.read'
                    &&
                    'The JWT scope claim is not set to "patient/*.read"'
                );

            tests.find(TEST_IDS.requestingSystemFormat)
                .setFailureState(
                    !requestingSystemMatcher.test(requesting_system)
                    &&
                    'The JWT requesting_system claim is not in the format https://fhir.nhs.uk/Id/accredited-system|[ASID]'
                );

            tests.find(TEST_IDS.requestingOrganizationFormat)
                .setFailureState(
                    !requestingOrganizationMatcher.test(requesting_organization)
                    &&
                    'The JWT requesting_organization claim is not in the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]'
                );
        }
    });
};
