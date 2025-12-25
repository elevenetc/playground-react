export class FunctionConnection {
    outFunctionId: string;
    inputArgumentId: string;

    constructor(outFunctionId: string, inputArgumentId: string) {
        this.outFunctionId = outFunctionId;
        this.inputArgumentId = inputArgumentId;
    }
}
