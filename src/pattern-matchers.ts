const _hex = '[0-9a-fA-F]';
const _asid = '\\d{12}';
const _odsCode = '[0-9a-zA-Z]{3,5}';
const _pipe = '(?:%7[cC]|\\|)'; // agnostic as to percent encoding

const _uuidMatcher =
    new RegExp(`^${_hex}{8}-${_hex}{4}-${_hex}{4}-${_hex}{4}-${_hex}{12}$`);

const _asidMatcher =
    new RegExp(`^${_asid}$`);

const _requestingSystemMatcher =
    new RegExp(`^https://fhir\\.nhs\\.uk/Id/accredited-system${_pipe}${_asid}$`);

const _requestingOrganizationMatcher =
    new RegExp(`^https://fhir\\.nhs\\.uk/Id/ods-organization-code${_pipe}${_odsCode}$`);

const createMatcher = (regex: RegExp) => (str: string) => regex.test(str);

const isUuid = createMatcher(_uuidMatcher);
const isAsid = createMatcher(_asidMatcher);
const isRequestingSystem = createMatcher(_requestingSystemMatcher);
const isRequestingOrganization = createMatcher(_requestingOrganizationMatcher);

export {
    isUuid,
    isAsid,
    isRequestingSystem,
    isRequestingOrganization,
};
