import { Request, Response, NextFunction } from 'express';

declare global {
    interface IStringMap<T> {
        [key: string]: T;
    }

    interface IRequest extends Request { }
    interface INextFunction extends NextFunction { }
    interface IResponse extends Response { }

    interface IDetailedResponse extends Response {
        body?: string;
        tests: ITest[];
    }

    type TestOutcome = 'pass' | 'warn' | 'fail';

    interface ITest {
        id: string;
        description: string;
        outcome: TestOutcome;
        details?: string;
    }

    interface IFileFormat {
        extension: string;
        mimeType: string;
        encoding: 'utf-8' | 'binary';
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
