import { Request, Response } from 'express';

class Validation implements IValidation {
    constructor(
        public validationId: string,
        public description: string,
        public request: Request,
        public response: Response
    ) { }

    public hasRun: boolean = false;
    public success?: boolean;
    public details?: string;

    public setOutcome(success: boolean, details?: string) {
        this.hasRun = true;
        this.success = success;
        this.details = details;

        return this;
    }

    public setFailureState(newFailureState: string | falsy) {
        this.setOutcome(!newFailureState, newFailureState || undefined);

        return this;
    }
}

export default class Validations implements IValidations {
    constructor(
        public request: Request,
        public response: Response,
    ) { }

    private _validationList: IValidation[] = [];

    public add(validationId: string, description: string) {
        if (this._find(validationId)) {
            throw new Error(`Duplicate validationId: ${validationId}`);
        }

        const validation = new Validation(validationId, description, this.request, this.response);

        this._validationList.push(validation);

        return validation;
    }

    private _find(validationId: string) {
        return this._validationList.find(validation => validationId === validation.validationId);
    }

    public find(validationId: string) {
        const validation = this._find(validationId);

        if (!validation) {
            throw new Error(`validationId not found: ${validationId}`);
        }

        return validation;
    }

    public list() {
        return this._validationList;
    }

    public listSerializable() {
        // Exclude circular structures to prevent `TypeError: Converting circular structure to JSON`

        return this._validationList.map(({ validationId, description, hasRun, success, details }) => ({
            validationId,
            description,
            hasRun,
            success,
            details,
        }));
    }
}
