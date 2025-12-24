import {FunctionCallGraph} from './FunctionCallGraph';

export class CallController {
    private graph: FunctionCallGraph;

    constructor(graph: FunctionCallGraph) {
        this.graph = graph;
    }

    canBeConnected(outFunctionId: string, inFunctionId: string, argumentIndex: number): boolean {
        const outFunction = this.graph.getFunction(outFunctionId);
        const inFunction = this.graph.getFunction(inFunctionId);

        if (!outFunction || !inFunction) {
            return false;
        }

        if (outFunction.returnType === 'Unit') {
            return false;
        }

        const inFunctionArgs = Array.from(inFunction.arguments.values());
        if (argumentIndex < 0 || argumentIndex >= inFunctionArgs.length) {
            return false;
        }

        const targetArgType = inFunctionArgs[argumentIndex];
        return outFunction.returnType === targetArgType;
    }
}
