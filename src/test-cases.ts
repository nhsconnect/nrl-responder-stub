class TestCase implements ITestCase {
    constructor(
        public tcId: string,
        public description: string,
        public req: IRequest,
        public res: IResponse
    ) { }

    public hasRun: boolean = false;
    public success?: boolean;
    public details?: string;

    public setOutcome(success: boolean, details?: string) {
        this.hasRun = true;
        this.success = success;
        this.details = details;
    }

    public setFailureState(newFailureState: string | boolean | null | undefined) {
        this.setOutcome(!newFailureState, typeof newFailureState === 'string' ? newFailureState : undefined);
    }
}

export default class TestCases implements ITestCases {
    constructor(
        public req: IRequest,
        public res: IResponse
    ) { }

    private _tcList: ITestCase[] = [];

    public add(tcId: string, description: string) {
        if (this._find(tcId)) {
            throw new Error(`Duplicate tcId: ${tcId}`);
        }

        const tc = new TestCase(tcId, description, this.req, this.res);

        this._tcList.push(tc);

        return tc;
    }

    private _find(tcId: string) {
        return this._tcList.find(tc => tcId === tc.tcId);
    }

    public find(tcId: string) {
        const tc = this._find(tcId);

        if (!tc) {
            throw new Error(`tcId not found: ${tcId}`);
        }

        return tc;
    }

    public all() {
        return this._tcList;
    }

    public allSerializable() {
        return this._tcList.map(tc => ({
            tcId: tc.tcId,
            description: tc.description,
            hasRun: tc.hasRun,
            success: tc.success,
            details: tc.details
        }));
    }
}
