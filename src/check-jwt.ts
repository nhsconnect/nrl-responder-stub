import httpStatus from './http-status';
import jwt from 'jsonwebtoken';
import { requestingSystemMatcher, requestingOrganizationMatcher } from './pattern-matchers';

const TOLERANCE_SECONDS = 30;

export default (_req: IRequest, res: IResponse, token: string): boolean => {
    jwt.verify(token, '', (err, decoded: any) => {
        if (err) {
            res
                .status(httpStatus.BadRequest)
                .send(`JWT verification error: ${JSON.stringify(err)}`);

            return false;
        } else {
            const mandatoryClaims = ['iss', 'sub', 'aud', 'exp', 'iat', 'reason_for_request', 'scope', 'requesting_system', 'requesting_organization'];
            
            const missingClaims = mandatoryClaims.filter(c => !decoded[c]);

            if (missingClaims.length) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The following mandatory JWT claims are missing or empty: ${missingClaims.join(', ')}`);

                return false;
            }

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

            if (iat > now + TOLERANCE_SECONDS) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT iat (issued at) claim cannot be in the future`);

                return false;
            }

            if (exp > in5Minutes + TOLERANCE_SECONDS) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT exp (expiration time) claim cannot be more than 5 minutes in the future`);

                return false;
            }

            if (iat > exp) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT iat (issued at) time cannot be after the exp (expiration time) time`);

                return false;
            }

            if (requesting_user && (sub !== requesting_user)) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`If requesting_user is present, the JWT sub (subject) claim must be the same as the requesting_user`);

                return false;
            }

            if (!requesting_user && (sub !== requesting_system)) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`If requesting_user is absent, the JWT sub (subject) claim must be the same as the requesting_system`);

                return false;
            }

            if (reason_for_request !== 'directcare') {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT reason_for_request claim must be set to "directcare"`);

                return false;
            }

            if (scope !== 'patient/*.read') {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT scope claim must be set to "patient/*.read"`);

                return false;
            }

            if (!requestingSystemMatcher.test(requesting_system)) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT requesting_system claim must be of the format https://fhir.nhs.uk/Id/accredited-system|[ASID]`);

                return false;
            }

            if (!requestingOrganizationMatcher.test(requesting_organization)) {
                res
                    .status(httpStatus.BadRequest)
                    .send(`The JWT requesting_organization claim must be of the format https://fhir.nhs.uk/Id/ods-organization-code|[ODSCode]`);

                return false;
            }
        }
    });

    return true;
};
