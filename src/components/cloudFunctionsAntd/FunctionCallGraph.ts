import { FunctionData } from './FunctionData';
import { FunctionCall } from './FunctionCall';

export class FunctionCallGraph {
    private functions: Map<string, FunctionData>;
    private calls: FunctionCall[];

    constructor() {
        this.functions = new Map();
        this.calls = [];
    }

    addFunction(functionData: FunctionData): void {
        this.functions.set(functionData.id, functionData);
    }

    removeFunction(id: string): void {
        this.functions.delete(id);
        this.calls = this.calls.filter(call => call.sourceId !== id && call.targetId !== id);
    }

    getFunction(id: string): FunctionData | undefined {
        return this.functions.get(id);
    }

    getAllFunctions(): Map<string, FunctionData> {
        return new Map(this.functions);
    }

    addCall(sourceId: string, targetId: string): void {
        if (!this.functions.has(sourceId) || !this.functions.has(targetId)) {
            throw new Error('Both source and target functions must exist');
        }
        this.calls.push(new FunctionCall(sourceId, targetId));
    }

    removeCall(sourceId: string, targetId: string): void {
        this.calls = this.calls.filter(
            call => !(call.sourceId === sourceId && call.targetId === targetId)
        );
    }

    getAllCalls(): FunctionCall[] {
        return [...this.calls];
    }

    getOutgoingCalls(functionId: string): FunctionCall[] {
        return this.calls.filter(call => call.sourceId === functionId);
    }

    getIncomingCalls(functionId: string): FunctionCall[] {
        return this.calls.filter(call => call.targetId === functionId);
    }

    hasLoop(): boolean {
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const hasCycle = (nodeId: string): boolean => {
            visited.add(nodeId);
            recStack.add(nodeId);

            const outgoing = this.getOutgoingCalls(nodeId);
            for (const call of outgoing) {
                if (!visited.has(call.targetId)) {
                    if (hasCycle(call.targetId)) return true;
                } else if (recStack.has(call.targetId)) {
                    return true;
                }
            }

            recStack.delete(nodeId);
            return false;
        };

        for (const [id] of this.functions) {
            if (!visited.has(id)) {
                if (hasCycle(id)) return true;
            }
        }

        return false;
    }
}
