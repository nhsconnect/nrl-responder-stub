import httpStatus from './http-status';

export default (req: IRequest, res: IResponse): responseSent => {
    // Ssp-TraceID  	    Consumer’s TraceID (i.e. GUID/UUID)
    // Ssp-From	            Consumer’s ASID
    // Ssp-To       	    Provider’s ASID
    // Ssp-InteractionID	Spine’s InteractionID.
    //                      The interaction ID for retrieving a record referenced in an NRL pointer is specific to the NRL service and is as follows:
    //                      urn:nhs:names:services:nrl:DocumentReference.content.read
    
    const requiredHeaders = ['Ssp-TraceID', 'Ssp-From', 'Ssp-To', 'Ssp-InteractionID', 'Authorization' ];

    const missingHeaders = requiredHeaders.filter(h => !Object.keys(req.headers).includes(h.toLowerCase()));

    if (missingHeaders.length) {
        res
            .status(httpStatus.BadRequest)
            .send(`The following required headers are missing: ${missingHeaders.join(', ')}`);
        
        return true;
    }
};
