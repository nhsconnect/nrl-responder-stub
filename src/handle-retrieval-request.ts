import respondWithFile from './respond-with-file';

import checkHeaders from './check-headers';
import buildFileInfo from './build-file-info';

export default (req: IRequest, res: IResponse) => {
    const headerErrorResponse = checkHeaders(req, res);

    if (headerErrorResponse) {
        return headerErrorResponse;
    }

    const fileInfoOrErrorResponse = buildFileInfo(req, res);

    const fileInfo = (fileInfoOrErrorResponse as any as { fileInfo: IFileInfo }).fileInfo;
    
    if (!fileInfo) {
        const pathErrorResponse = fileInfoOrErrorResponse;

        return pathErrorResponse;
    }

    return respondWithFile(res, fileInfo);
};
