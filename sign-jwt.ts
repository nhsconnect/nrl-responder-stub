const jwt = require('jsonwebtoken');

const token = jwt.sign({
    iss: 'https://cas.nhs.uk',
    sub: 'https://fhir.nhs.uk/Id/sds-role-profile-id|387429785309275',
    aud: 'https://clinicals.spineservices.nhs.uk',
    reason_for_request: 'directcare',
    scope: 'patient/*.read',
    requesting_system: 'https://fhir.nhs.uk/Id/accredited-system|200000000205',
    requesting_user: 'https://fhir.nhs.uk/Id/sds-role-profile-id|4387293874928',
    requesting_organization: 'https://fhir.nhs.uk/Id/ods-organization-code|123456'
}, '', {
    algorithm: 'none',
    expiresIn: '5m'
});

jwt.verify(token, '', (err: any, _decoded: any) => {
    if (err) {
        console.error('error', err);
    } else {
        require('child_process').exec(
            `printf ${token} | clip`,
            () => console.log('Copied JWT to clipboard')
        );
    }
});
