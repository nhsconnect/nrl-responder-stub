import { Request, Response, NextFunction } from 'express';

declare global {
    interface IRequest extends Request { }
    interface INextFunction extends NextFunction { }

    interface IResponse extends Response {
        body?: string;
        tests?: Test[];
    }

    type SeverityLevel = 'error' | 'warn' | 'info';

    type Test = IPassedTest | IFailedTest;

    interface ITestBase {
        description: string;
    }

    interface IPassedTest extends ITestBase {
        success: true;
    }

    interface IFailedTest extends ITestBase {
        success: false;
        details: string;
        severity: SeverityLevel;
    }

    interface IHttpStatusMap {
        [key: string]: number;
    }

    interface IFileFormats {
        [key: string]: IFileFormat;
    }

    interface IFileFormat {
        extension: string;
        mimeType: string;
        encoding: 'utf-8' | 'binary';
    }

    interface IProviderData {
        providers: {
            [key: string]: IProvider;
        }
    }

    interface IProvider {
        url: string;
        patients: {
            [key: string]: IPatient;
        }
    }

    interface IPatient {
        id: string;
        records: {
            [key: string]: IRecord;
        }
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
