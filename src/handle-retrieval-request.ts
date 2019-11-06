import respondWithFile from './respond-with-file';

import checkHeaders from './check-headers';
import buildFileInfo from './build-file-info';

const isFileInfo = (maybeFileInfo: any): maybeFileInfo is IFileInfo => {
    return [ 'patient', 'record', 'fileFormat' ]
            .every(propName => maybeFileInfo?.hasOwnProperty?.(propName));
};

export default (req: IRequest, res: IResponse) => {
    const headersValid = checkHeaders(req, res);

    if (!headersValid) {
        return false;
    }

    const fileInfoOrErrorResponse = buildFileInfo(req, res);
    
    if (isFileInfo(fileInfoOrErrorResponse)) {
        respondWithFile(res, fileInfoOrErrorResponse);
        
        return true;
    } else { // is error response
        return false;
    }
};
