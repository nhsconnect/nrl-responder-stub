const { suppressedTestIds = [] }: { suppressedTestIds: string[] } = require("./config");

class Test implements ITest {
    constructor(
        public testId: string,
        public description: string,
        public req: IRequest,
        public res: IResponse
    ) { }

    public hasRun: boolean = false;
    public success?: boolean;
    public details?: string;

    public setOutcome(success: boolean, details?: string) {
        if (!suppressedTestIds.includes(this.testId)) {
            this.hasRun = true;
            this.success = success;
            this.details = details;
        }

        return this;
    }

    public setFailureState(newFailureState: string | falsy) {
        this.setOutcome(!newFailureState, newFailureState || undefined);

        return this;
    }
}

export default class Tests implements ITests {
    constructor(
        public req: IRequest,
        public res: IResponse,
        public meta: { suppressedTestIds: string[]; }
    ) { }

    private _testList: ITest[] = [];

    public add(testId: string, description: string) {
        if (this._find(testId)) {
            throw new Error(`Duplicate testId: ${testId}`);
        }

        const test = new Test(testId, description, this.req, this.res);

        this._testList.push(test);

        return test;
    }

    private _find(testId: string) {
        return this._testList.find(test => testId === test.testId);
    }

    public find(testId: string) {
        const test = this._find(testId);

        if (!test) {
            throw new Error(`testId not found: ${testId}`);
        }

        return test;
    }

    public list() {
        return this._testList;
    }

    public listSerializable() {
        // Exclude circular structures to prevent `TypeError: Converting circular structure to JSON`

        return this._testList.map(({ testId, description, hasRun, success, details }) => ({
            testId,
            description,
            hasRun,
            success,
            details
        }));
    }
}
