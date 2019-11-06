import respondWithFile from './respond-with-file';

import checkHeaders from './check-headers';
import buildFileInfo from './build-file-info';

const isFileInfo = (maybeFileInfo: any): maybeFileInfo is IFileInfo => {
    return [ 'patient', 'record', 'fileFormat' ]
            .every(propName => maybeFileInfo?.hasOwnProperty?.(propName));
};

export default (req: IRequest, res: IResponse) => {
    const headerErrorResponseSent = checkHeaders(req, res);

    if (headerErrorResponseSent) {
        return headerErrorResponseSent;
    }

    const fileInfoOrErrorResponse = buildFileInfo(req, res);
    
    if (isFileInfo(fileInfoOrErrorResponse)) {
        return respondWithFile(res, fileInfoOrErrorResponse);
    } else { // is error response
        return fileInfoOrErrorResponse;
    }
};
