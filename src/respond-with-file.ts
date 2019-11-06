import fs from 'fs';
import path from 'path';
import httpStatus from './http-status';

export default (res: IResponse, fileInfo: IFileInfo) => {
    const { patient, record, fileFormat } = fileInfo;

    res
        .status(httpStatus.OK)
        .type(fileFormat.mimeType);
    
    if (fileFormat.encoding === 'binary') {
        return res
            .sendFile(path.join(
                __dirname,
                `static/responses/sample.${fileFormat.extension}`
            ));
    }

    let file = fs.readFileSync(path.join(
        __dirname,
        `static/responses/sample.${fileFormat.extension}.tmp`
    ), 'utf8');

    const replacements = {
        patientId: patient.id,
        recordId: record.id,
        description: record.desc,
    };

    Object.entries(replacements).forEach(([key, val]) => {
        file = file.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val);
    });

    return res
        .send(file);
};
