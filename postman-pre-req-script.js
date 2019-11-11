// modified from https://gist.github.com/corbanb/db03150abbe899285d6a86cc480f674d

const base64url = source => {
    // Encode in classical base64
    encodedSource = CryptoJS.enc.Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
};

const header = {
    "alg": "none",
    "typ": "JWT"
};

const now = Math.floor(Date.now() / 1000);
const in5Minutes = now + 5 * 60;

const _payload = {
    iss: 'https://cas.nhs.uk',
    sub: 'https://fhir.nhs.uk/Id/sds-role-profile-id|4387293874928',
    aud: 'https://clinicals.spineservices.nhs.uk',
    reason_for_request: 'directcare',
    scope: 'patient/*.read',
    requesting_system: 'https://fhir.nhs.uk/Id/accredited-system|200000000205',
    requesting_user: 'https://fhir.nhs.uk/Id/sds-role-profile-id|4387293874928',
    requesting_organization: 'https://fhir.nhs.uk/Id/ods-organization-code|12345',
    iat: now,
    exp: in5Minutes
};

const makeJwt = (payloadUpdates = {}) => {
    // encode header
    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const encodedHeader = base64url(stringifiedHeader);

    // encode data
    const payload = JSON.parse(JSON.stringify(_payload));
    Object.entries(payloadUpdates).forEach(([k, v]) => {
        if (typeof v === 'undefined') {
            delete payload[k];
        } else {
            payload[k] = v;
        }
    })

    const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    const encodedPayload = base64url(stringifiedPayload);

    // build token
    const token = encodedHeader + "." + encodedPayload;

    // sign token
    return token + ".";
};

pm.variables.set('jwt', makeJwt());

pm.variables.set('jwtNoIss', makeJwt({ iss: undefined }));
pm.variables.set('jwtNoSub', makeJwt({ sub: undefined }));
pm.variables.set('jwtNoAud', makeJwt({ aud: undefined }));
pm.variables.set('jwtNoReasonForRequest', makeJwt({ reason_for_request: undefined }));
pm.variables.set('jwtNoScope', makeJwt({ scope: undefined }));
pm.variables.set('jwtNoRequestingSystem', makeJwt({ requesting_system: undefined }));
pm.variables.set('jwtNoRequestingOrganization', makeJwt({ requesting_organization: undefined }));
pm.variables.set('jwtNoIat', makeJwt({ iat: undefined }));
pm.variables.set('jwtNoExp', makeJwt({ exp: undefined }));

pm.variables.set('jwtNoRequestingUser', makeJwt({ // still valid
    requesting_user: undefined,
    sub: _payload.requesting_system
}));

pm.variables.set('jwtIssuedInFuture', makeJwt({
    iss: _payload.iss + 10000,
    exp: _payload.exp + 10000,
}));

pm.variables.set('jwtExpiryOver5Mins', makeJwt({
    exp: _payload.exp + 10000
}));

pm.variables.set('jwtIssuedAfterExpiry', makeJwt({
    exp: _payload.iss - 1
}));

pm.variables.set('jwtSubNotRequestingUser', makeJwt({
    sub: _payload.requesting_system
}));

pm.variables.set('jwtSubNotRequestingSystem', makeJwt({
    requesting_user: undefined,
    sub: _payload.requesting_user
}));

pm.variables.set('jwtReasonForRequest', makeJwt({
    reason_for_request: '0000'
}));

pm.variables.set('jwtScope', makeJwt({
    scope: '0000'
}));

pm.variables.set('jwtRequestingSystemFormat', makeJwt({
    requesting_system: '0000'
}));

pm.variables.set('jwtRequestingOrganizationFormat', makeJwt({
    requesting_organization: '0000'
}));
