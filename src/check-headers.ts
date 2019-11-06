import httpStatus from './http-status';
import checkJwt from './check-jwt';

export default (req: IRequest, res: IResponse): boolean => {
    // Ssp-TraceID  	    Consumer’s TraceID (i.e. GUID/UUID)
    // Ssp-From	            Consumer’s ASID
    // Ssp-To       	    Provider’s ASID
    // Ssp-InteractionID	Spine’s InteractionID.
    //                      The interaction ID for retrieving a record referenced in an NRL pointer is specific to the NRL service and is as follows:
    //                      urn:nhs:names:services:nrl:DocumentReference.content.read
    
    const { headers } = req;

    const requiredHeaders = [ 'Ssp-TraceID', 'Ssp-From', 'Ssp-To', 'Ssp-InteractionID', 'Authorization' ];

    const missingHeaders = requiredHeaders.filter(h => !headers[h.toLowerCase()]);

    if (missingHeaders.length) {
        res
            .status(httpStatus.BadRequest)
            .send(`The following required headers are missing or empty: ${missingHeaders.join(', ')}`);
        
        return false;
    }

    if (headers['ssp-interactionid'] !== 'urn:nhs:names:services:nrl:DocumentReference.content.read') {
        res
            .status(httpStatus.BadRequest)
            .send(`The Ssp-InteractionID header must have the value urn:nhs:names:services:nrl:DocumentReference.content.read`);

        return false;
    }

    const hexChars = '[0-9a-f]';
    const uuidRegex = new RegExp(`^${hexChars}{8}-${hexChars}{4}-${hexChars}{4}-${hexChars}{4}-${hexChars}{12}$`, 'i');

    if (!uuidRegex.test(headers['ssp-traceid'] as string)) {
        res
            .status(httpStatus.BadRequest)
            .send(`The Ssp-TraceID header must be a UUID in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (where each x is a hex digit)`);

        return false;
    }

    const authHeader = headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        res
            .status(httpStatus.BadRequest)
            .send('The Authorization header must start with "Bearer "');

        return false;
    }

    if (!checkJwt(authHeader.replace(/^Bearer /, ''))) {
        return false;
    }
    
    return true;
};
