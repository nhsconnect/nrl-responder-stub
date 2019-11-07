const _hexFragment = '[0-9a-fA-F]';
const _asidFragment = '\\d{12}';
const _odsCodeFragment = '[0-9a-zA-Z]{3,5}';

const uuidMatcher = new RegExp(
    `^${_hexFragment}{8}-${_hexFragment}{4}-${_hexFragment}{4}-${_hexFragment}{4}-${_hexFragment}{12}$`
);

const asidMatcher = new RegExp(`^${_asidFragment}$`);

const requestingSystemMatcher = new RegExp(`^https://fhir\.nhs\.uk/Id/accredited-system\|${_asidFragment}$`);

const requestingOrganizationMatcher = new RegExp(
    `^https://fhir\.nhs\.uk/Id/ods-organization-code\|${_odsCodeFragment}$`
);

export {
    uuidMatcher,
    asidMatcher,
    requestingSystemMatcher,
    requestingOrganizationMatcher
};
