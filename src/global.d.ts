import { Request, Response } from 'express';

declare global {
    interface IResponse extends Response {}
    interface IRequest extends Request {}

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
