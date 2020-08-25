import validateHeaders from './validate-headers';
import Validations from './validations';

export default (validations: Validations) => {
    validateHeaders(validations);
};
