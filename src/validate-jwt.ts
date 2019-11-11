import httpStatus from './http-status';
import jwt from 'jsonwebtoken';
import { requestingSystemMatcher, requestingOrganizationMatcher } from './pattern-matchers';

const TOLERANCE_SECONDS = 30;

const TC_IDS = {
    parseJwt: '__j__1',
    missingClaims: '__j__2',
    issuedInFuture: '__j__3',
    expiryOver5Mins: '__j__4',
    issuedAfterExpiry: '__j__5',
    subNotRequestingUser: '__j__6',
    subNotRequestingSystem: '__j__7',
    reasonForRequest: '__j__8',
    scope: '__j__9',
    requestingSystemFormat: '__j__10',
    requestingOrganizationFormat: '__j__11'
};

export default (tcs: ITestCases, token: string) => {
    const mandatoryClaims = ['iss', 'sub', 'aud', 'exp', 'iat', 'reason_for_request', 'scope', 'requesting_system', 'requesting_organization'];

    tcs.add(TC_IDS.parseJwt, 'JWT must be parsable');
    tcs.add(TC_IDS.missingClaims, `The following mandatory JWT claims must all be present: [ ${mandatoryClaims.join(', ')} ]`);
    tcs.add(TC_IDS.issuedInFuture, 'The JWT iat (issued at) claim cannot be in the future');
    tcs.add(TC_IDS.expiryOver5Mins, 'The JWT exp (expiration time) claim cannot be more than 5 minutes in the future');
    tcs.add(TC_IDS.issuedAfterExpiry, 'The JWT iat (issued at) time cannot be after the exp (expiration time) time');
    tcs.add(TC_IDS.subNotRequestingUser, 'If requesting_user is present, the JWT sub (subject) claim must be the same as the requesting_user');
    tcs.add(TC_IDS.subNotRequestingSystem, 'If requesting_user is absent, the JWT sub (subject) claim must be the same as the requesting_system');
    tcs.add(TC_IDS.reasonForRequest, 'The JWT reason_for_request claim must be set to "directcare"');
    tcs.add(TC_IDS.scope, 'The JWT scope claim must be set to "patient/*.read"');
    tcs.add(TC_IDS.requestingSystemFormat, 'The JWT requesting_system claim must be of the format https://fhir.nhs.uk/Id/accredited-system|[ASID]');
    tcs.add(TC_IDS.requestingOrganizationFormat, 'The JWT requesting_organization claim must be of the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]');

    jwt.verify(token, '', (err, decoded: any) => {
        tcs.find(TC_IDS.parseJwt)
            .setFailureState(
                !!err
                &&
                `JWT parsing error: ${JSON.stringify(err)}`
            );

        if (!err) {
            const missingClaims = mandatoryClaims.filter(c => !decoded[c]);

            tcs.find(TC_IDS.missingClaims)
                .setFailureState(
                    !!missingClaims.length
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

            tcs.find(TC_IDS.issuedInFuture)
                .setFailureState(
                    iat > now + TOLERANCE_SECONDS
                    &&
                    'The JWT iat (issued at) claim is in the future'
                );

            tcs.find(TC_IDS.expiryOver5Mins)
                .setFailureState(
                    exp > in5Minutes + TOLERANCE_SECONDS
                    &&
                    'The JWT exp (expiration time) claim is more than 5 minutes in the future'
                );

            tcs.find(TC_IDS.issuedAfterExpiry)
                .setFailureState(
                    iat > exp
                    &&
                    'The JWT iat (issued at) time is after the exp (expiration time) time'
                );

            tcs.find(TC_IDS.subNotRequestingUser)
                .setFailureState(
                    requesting_user && (sub !== requesting_user)
                    &&
                    'JWT requesting_user is present and sub (subject) claim is different from requesting_user'
                );

            tcs.find(TC_IDS.subNotRequestingSystem)
                .setFailureState(
                    !requesting_user && (sub !== requesting_system)
                    &&
                    'JWT requesting_user is absent and sub (subject) claim is different from requesting_system'
                );

            tcs.find(TC_IDS.reasonForRequest)
                .setFailureState(
                    reason_for_request !== 'directcare'
                    &&
                    'The JWT reason_for_request claim is not set to "directcare"'
                );

            tcs.find(TC_IDS.scope)
                .setFailureState(
                    scope !== 'patient/*.read'
                    &&
                    'The JWT scope claim is not set to "patient/*.read"'
                );

            tcs.find(TC_IDS.requestingSystemFormat)
                .setFailureState(
                    !requestingSystemMatcher.test(requesting_system)
                    &&
                    'The JWT requesting_system claim is not of the format https://fhir.nhs.uk/Id/accredited-system|[ASID]'
                );

            tcs.find(TC_IDS.requestingOrganizationFormat)
                .setFailureState(
                    !requestingOrganizationMatcher.test(requesting_organization)
                    &&
                    'The JWT requesting_organization claim is not of the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]'
                );
        }
    });
};
