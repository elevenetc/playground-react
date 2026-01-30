const ARG_ID_PATTERN = /^(.+)-arg-(\d+)$/;

export function parseArgumentId(argumentId: string): { functionId: string; argIndex: number } {
    const match = argumentId.match(ARG_ID_PATTERN);
    if (!match) {
        throw new Error(`Invalid argument ID format: "${argumentId}". Expected format: "functionId-arg-N"`);
    }
    return {functionId: match[1], argIndex: parseInt(match[2], 10)};
}

export function buildArgumentId(functionId: string, argIndex: number): string {
    if (argIndex < 0 || !Number.isInteger(argIndex)) {
        throw new Error(`Invalid argument index: ${argIndex}. Must be a non-negative integer`);
    }
    return `${functionId}-arg-${argIndex}`;
}

export function isValidArgumentId(argumentId: string): boolean {
    return ARG_ID_PATTERN.test(argumentId);
}

export class FunctionConnection {
    outFunctionId: string;
    targetFunctionId: string;
    targetArgIndex: number;

    constructor(outFunctionId: string, targetFunctionId: string, targetArgIndex: number = 0) {
        this.outFunctionId = outFunctionId;
        this.targetFunctionId = targetFunctionId;
        this.targetArgIndex = targetArgIndex;
    }

    get inputArgumentId(): string {
        return buildArgumentId(this.targetFunctionId, this.targetArgIndex);
    }

    static fromArgumentId(outFunctionId: string, inputArgumentId: string): FunctionConnection {
        const {functionId, argIndex} = parseArgumentId(inputArgumentId);
        return new FunctionConnection(outFunctionId, functionId, argIndex);
    }
}
