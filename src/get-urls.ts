const constructUrl = (providerUrl: string, patientId: string, recordId: string, extension: string) => {
    return `${providerUrl}/api/patients/${patientId}/records/${recordId}.${extension}`;
};

export default (providerData: IProviderData) => {
    const urls: string[] = [];

    Object.entries(providerData.providers).forEach(([providerUrl, provider]) => {
        Object.entries(provider.patients).forEach(([patientId, patient]) => {
            Object.entries(patient.records).forEach(([recordId, record]) => {
                record.availableFormats.forEach((format) => {
                    const url = constructUrl(providerUrl, patientId, recordId, format);

                    urls.push(url);
                });
            });
        });
    });

    return urls;
};
