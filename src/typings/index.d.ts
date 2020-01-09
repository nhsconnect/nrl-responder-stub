import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

declare global {
    type filename = string;

    type IConfigOverrides = Partial<IConfig>;

    interface ITestCase {
        name: string;
        endpoint: string;
        expect: {
            responseCode: number;
            validations: boolean | string[];
        };
    }

    interface ILogEntry {
        meta?: {
            title: string;
            description?: string;
            expect: {
                responseCode: number;
                validations: boolean | string[];
            };
        };
        req: {
            headers: IncomingHttpHeaders;
            httpVersion: string;
            method: string;
            path: string;
            body: any;
        };
        res: {
            statusCode: number;
            headers: OutgoingHttpHeaders;
            body: string | undefined;
        };
        validations: ISerializableValidation[] | undefined;
    }

    interface IConfig {
        mode: 'guided' | 'exploratory';

        endpointFormat: 'local' | 'integration';

        useFhirMimeTypes?: boolean;
        explicitlySetUtf8?: boolean;

        port: number;

        reportOutputs: {
            stdout?: boolean;
            reportsDir?: boolean;
        };

        logBodyMaxLength: number;

        pathFileMapping: {
            [path: string]: filename;
        };
    }

    interface IStringMap<T> {
        [key: string]: T;
    }

    type IRequest = Request;
    type IResponse = Response & { body?: string };
    type INextFunction = NextFunction;

    interface IValidations {
        req: IRequest;
        res: IResponse;

        add: (validationId: string, description: string) => IValidation;
        find: (validationId: string) => IValidation;
        list: () => IValidation[];
        listSerializable: () => ISerializableValidation[];
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
        baseMimeType: string;
        fhirMimeType: string;
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
