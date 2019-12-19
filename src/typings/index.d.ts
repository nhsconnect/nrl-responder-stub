import { Request, Response, NextFunction } from 'express';

declare global {
    type filename = string;

    type IConfigOverrides = Partial<IConfig>;

    interface IConfig {
        mode: 'guided' | 'exploratory';

        endpointFormat: 'local' | 'integration';

        useFhirMimeTypes?: boolean;

        port: number;

        reportOutputs: {
            stdout?: boolean;
            reportsDir?: boolean;
        };

        suppressedValidations: boolean | string[];

        logBodyMaxLength: number;

        pathFileMapping: {
            [path: string]: filename;
        };
    }

    interface IStringMap<T> {
        [key: string]: T;
    }

    interface IRequest extends Request { }
    interface INextFunction extends NextFunction { }
    interface IResponse extends Response {
        body?: string;
    }

    interface IValidations {
        req: IRequest;
        res: IResponse;

        add: (validationId: string, description: string) => IValidation;
        find: (validationId: string) => IValidation;
        list: () => IValidation[];
        listSerializable: () => ISerializableValidation[];
        meta: {
            suppressedValidations: boolean | string[];
        }
    }

    type falsy = false | null | undefined | 0;

    interface IValidation {
        validationId: string;
        description: string;

        req: IRequest;
        res: IResponse;

        hasRun: boolean;
        success?: boolean;
        details?: string;
        
        setOutcome: (success: boolean, details?: string) => void;
        setFailureState: (newFailureState: string | falsy) => void;
    }

    interface ISerializableValidation {
        validationId: string;
        description: string;
        hasRun: boolean;
        success?: boolean;
        details?: string;
    }

    interface IFileFormat {
        extension: string;
        mimeType: string;
    }

    interface IProviderData {
        providers: IStringMap<IProvider>
    }

    interface IProvider {
        url: string;
        patients: IStringMap<IPatient>

    }

    interface IPatient {
        id: string;
        records: IStringMap<IRecord>
    }

    interface IRecord {
        id: string;
        desc: string;
        availableFormats: string[];
    }

    interface IFileInfo {
        patient: IPatient;
        record: IRecord;
        fileFormat: IFileFormat;
    }
}
