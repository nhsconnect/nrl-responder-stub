import { Request, Response } from 'express';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

declare global {
    type filename = string;

    interface LogEntry {
        meta?: {
            title: string;
            description?: string;
            expect: {
                responseCode: number;
                validations: boolean | string[];
            };
        };
        request: {
            headers: IncomingHttpHeaders;
            httpVersion: string;
            method: string;
            path: string;
            body: any;
        };
        response: {
            statusCode: number;
            headers: OutgoingHttpHeaders;
            body: string | undefined;
        };
        validations: SerializableValidation[] | undefined;
    }

    interface Config {
        environment: 'local' | 'integration';

        useFhirMimeTypes?: boolean;
        explicitlySetUtf8?: boolean;

        port: number;

        reportOutputs: {
            stdout?: boolean;
            reportsDir?: boolean;
        };

        logBodyMaxLength: number;

        sslCACert: string | null;
        sslServerCert: string | null;
        sslServerKey: string | null;

        sslInsecure?: boolean;
    }

    type falsy = false | null | undefined | 0;

    interface IValidation {
        validationId: string;
        description: string;

        request: Request;
        response: Response;

        hasRun: boolean;
        success?: boolean;
        details?: string;
        
        setOutcome: (success: boolean, details?: string) => void;
        setFailureState: (newFailureState: string | falsy) => void;
    }

    interface SerializableValidation {
        validationId: string;
        description: string;
        hasRun: boolean;
        success?: boolean;
        details?: string;
    }

    interface FileFormat {
        extension: string;
        baseMimeType: string;
        fhirMimeType: string;
    }

    interface ProviderData {
        providers: Record<string, Provider>
    }

    interface Provider {
        url: string;
        patients: Record<string, Patient>
    }

    interface Patient {
        id: string;
        records: Record<string, RlsRecord>
    }

    interface RlsRecord {
        id: string;
        desc: string;
        availableFormats: string[];
    }

    interface FileInfo {
        patient: Patient;
        record: RlsRecord;
        fileFormat: FileFormat;
    }
}
