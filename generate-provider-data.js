{

    // https://www.lipsum.com/feed/html
    const lipsums = [...document.querySelectorAll('p')].map(el => el.textContent.trim());

    // https://www.guidgenerator.com/online-guid-generator.aspx
    const guids = `3b687ca0-47d7-4d2f-846c-768c9b7138bb
cb8e5386-35c4-4dd3-a6ce-7f08fa8853f8
5a85cbb4-6269-4717-a971-a679f0df3695
e8b29106-944a-4bc1-b7b8-62f878717129
3a66ed28-4698-4890-a9d1-510c65a8c58f
7ffbe764-f75d-4fcd-9fc6-c73f2e49bd59
0bcb902c-b5c6-401e-811a-e723fb231e7c
d691270d-840a-41dd-9a65-5ddb204d7648
24489da9-1211-42cc-b2e7-42d59c18bc62
47d2c47f-dea0-4c26-879d-86bbd3d7de59
2c324fab-0ab8-49f5-a5dd-a104bc47b170
a9d28e6d-7203-401e-8e8a-69b089e09ff5
de973b02-8ef6-40d8-866f-82f81396a914
99ddacb4-038f-4954-85da-04e98cd7d395
03f3e447-1d3a-4591-9eda-85924e11165f
829fc68a-7582-4a48-883e-8a61efc859b8
4d256ec0-cfd9-4713-97e9-fd8cbd093601
ad5fb34e-ed82-4f4a-b283-c12c57711750
14fa54ba-4601-4779-9d6c-4659184464b5
8fb0f19d-b0ac-487f-af4e-5368f4574c9e
55e5292b-e361-4607-a023-3da6d757cff2
aa88a504-bcf1-4c45-9b85-d4181d3130a1
ea0fee31-0be9-4e8b-98e7-01c82989aed6
a8c43ae7-b205-4aa5-b563-cf3360ad5512
89c8e364-3f9e-4ee5-8ca3-a8e1effc1f45
b9ca5805-90f6-40b0-87f1-65fc054697f6
f44e36b2-decd-4f62-acf7-ef1eebbecfdf
ab03fcf5-d7ee-40dc-bf1f-7b1cee9d19eb
725dbb9d-8c42-4a58-9fb2-91246ff36ede
69011403-d022-4374-8269-3a09c071594d`.split('\n').map(g => g.trim());

    let lipsumIdx = 0;
    let guidIdx = 0;

    const providers = [
        'https://provider1.example.com',
        'https://provider2.example.com',
    ];

    const formats = ['html', 'json', 'pdf', 'xml'];

    const data = { providers: {} };

    providers.forEach(p => {
        const _providers = data.providers[p] = { url: p };
        const patients = _providers.patients = {};

        for (let i = 0; i < 2; ++i) {
            const patient = patients[guids[guidIdx]] = { id: guids[guidIdx] };
            const records = patient.records = {};

            for (let j = 0; j < 2; ++j) {
                ++guidIdx;
                const record = records[guids[guidIdx]] = { id: guids[guidIdx] };
                record.desc = lipsums[lipsumIdx];
                record.availableFormats = formats;

                ++lipsumIdx;
            }

            ++guidIdx;
        }
    });

    JSON.stringify(data);

}