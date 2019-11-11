import { Request, Response, NextFunction } from 'express';

declare global {
    interface IStringMap<T> {
        [key: string]: T;
    }

    interface IRequest extends Request { }
    interface INextFunction extends NextFunction { }
    interface IResponse extends Response {
        body?: string;
    }

    interface ITestCases {
        req: IRequest;
        res: IResponse;

        add: (tcId: string, description: string) => ITestCase;
        find: (tcId: string) => ITestCase;
        all: () => ITestCase[];
        allSerializable: () => ISerializableTestCase[];
    }

    interface ITestCase {
        tcId: string;
        description: string;

        req: IRequest;
        res: IResponse;

        hasRun: boolean;
        success?: boolean;
        details?: string;
        
        setOutcome: (success: boolean, details?: string) => void;
        setFailureState: (newFailureState: string | boolean | null | undefined) => void;
    }

    interface ISerializableTestCase {
        tcId: string;
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
