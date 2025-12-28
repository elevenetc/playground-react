export class FunctionConnection {
    outFunctionId: string;
    targetFunctionId: string;
    targetArgIndex: number;

    constructor(outFunctionId: string, targetFunctionId: string, targetArgIndex: number = 0) {
        this.outFunctionId = outFunctionId;
        this.targetFunctionId = targetFunctionId;
        this.targetArgIndex = targetArgIndex;
    }

    // Backward compatibility: map to old inputArgumentId
    get inputArgumentId(): string {
        return this.targetFunctionId;
    }
}
