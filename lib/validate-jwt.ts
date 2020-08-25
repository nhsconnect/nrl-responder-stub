import jwt from 'jsonwebtoken';
import {
    isRequestingSystem,
    isRequestingOrganization,
} from './pattern-matchers';
import Validations from './validations';

const TOLERANCE_SECONDS = 30;

const VALIDATION_IDS = {
    parseJwt: 'parse-jwt',
    missingClaims: 'missing-claims',
    issuedInFuture: 'issued-in-future',
    expiryOver5Mins: 'expiry-over-5-mins',
    issuedAfterExpiry: 'issued-after-expiry',
    subNotRequestingUser: 'sub-not-requesting-user',
    reasonForRequest: 'reason-for-request',
    scope: 'scope',
    requestingSystemFormat: 'requesting-system-format',
    requestingOrganizationFormat: 'requesting-organization-format',
};

export default (validations: Validations, token: string) => {
    const mandatoryClaims = [
        'iss',
        'sub',
        'aud',
        'exp',
        'iat',
        'reason_for_request',
        'scope',
        'requesting_system',
        'requesting_organization',
        'requesting_user',
    ];

    validations.add(VALIDATION_IDS.parseJwt, 'JWT must be parsable');
    validations.add(
        VALIDATION_IDS.missingClaims,
        `The following mandatory JWT claims must all be present: [ ${mandatoryClaims.join(
            ', ',
        )} ]`,
    );
    validations.add(
        VALIDATION_IDS.issuedInFuture,
        'The JWT iat (issued at) claim cannot be in the future',
    );
    validations.add(
        VALIDATION_IDS.expiryOver5Mins,
        'The JWT exp (expiration time) claim cannot be more than 5 minutes in the future',
    );
    validations.add(
        VALIDATION_IDS.issuedAfterExpiry,
        'The JWT iat (issued at) time cannot be after the exp (expiration time) time',
    );
    validations.add(
        VALIDATION_IDS.subNotRequestingUser,
        'The JWT sub (subject) claim must be the same as the requesting_user',
    );
    validations.add(
        VALIDATION_IDS.reasonForRequest,
        'The JWT reason_for_request claim must be set to "directcare"',
    );
    validations.add(
        VALIDATION_IDS.scope,
        'The JWT scope claim must be set to "patient/*.read"',
    );
    validations.add(
        VALIDATION_IDS.requestingSystemFormat,
        'The JWT requesting_system claim must be in the format https://fhir.nhs.uk/Id/accredited-system|[ASID]',
    );
    validations.add(
        VALIDATION_IDS.requestingOrganizationFormat,
        'The JWT requesting_organization claim must be in the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]',
    );

    jwt.verify(token, '', (err, decoded: any) => {
        validations
            .find(VALIDATION_IDS.parseJwt)
            .setFailureState(
                err && `JWT parsing error: ${JSON.stringify(err)}`,
            );

        if (!err) {
            const missingClaims = mandatoryClaims.filter(c => !decoded[c]);

            validations
                .find(VALIDATION_IDS.missingClaims)
                .setFailureState(
                    missingClaims.length &&
                        `The following mandatory JWT claims are missing or empty: [ ${missingClaims.join(
                            ', ',
                        )} ]`,
                );

            const {
                iat,
                exp,
                sub,
                reason_for_request,
                scope,
                requesting_system,
                requesting_organization,
                requesting_user,
            } = decoded;

            const now = Math.floor(Date.now() / 1000);
            const in5Minutes = now + 5 * 60;

            validations
                .find(VALIDATION_IDS.issuedInFuture)
                .setFailureState(
                    iat > now + TOLERANCE_SECONDS &&
                        'The JWT iat (issued at) claim is in the future',
                );

            validations
                .find(VALIDATION_IDS.expiryOver5Mins)
                .setFailureState(
                    exp > in5Minutes + TOLERANCE_SECONDS &&
                        'The JWT exp (expiration time) claim is more than 5 minutes in the future',
                );

            validations
                .find(VALIDATION_IDS.issuedAfterExpiry)
                .setFailureState(
                    iat > exp &&
                        'The JWT iat (issued at) time is after the exp (expiration time) time',
                );

            validations
                .find(VALIDATION_IDS.subNotRequestingUser)
                .setFailureState(
                    sub !== requesting_user &&
                        'The sub (subject) claim is different from requesting_user',
                );

            validations
                .find(VALIDATION_IDS.reasonForRequest)
                .setFailureState(
                    reason_for_request !== 'directcare' &&
                        'The JWT reason_for_request claim is not set to "directcare"',
                );

            validations
                .find(VALIDATION_IDS.scope)
                .setFailureState(
                    scope !== 'patient/*.read' &&
                        'The JWT scope claim is not set to "patient/*.read"',
                );

            validations
                .find(VALIDATION_IDS.requestingSystemFormat)
                .setFailureState(
                    !isRequestingSystem(requesting_system) &&
                        'The JWT requesting_system claim is not in the format https://fhir.nhs.uk/Id/accredited-system|[ASID]',
                );

            validations
                .find(VALIDATION_IDS.requestingOrganizationFormat)
                .setFailureState(
                    !isRequestingOrganization(requesting_organization) &&
                        'The JWT requesting_organization claim is not in the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]',
                );
        }
    });
};
