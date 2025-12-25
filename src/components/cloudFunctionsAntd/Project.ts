import {Function} from './Function';
import {FunctionConnection} from './FunctionConnection';

export class Project {
    private functions: Map<string, Function>;
    private connections: FunctionConnection[];

    constructor() {
        this.functions = new Map();
        this.connections = [];
    }

    addFunction(functionData: Function): void {
        this.functions.set(functionData.id, functionData);
    }

    removeFunction(id: string): void {
        this.functions.delete(id);
        this.connections = this.connections.filter(call => call.outFunctionId !== id && call.inputArgumentId !== id);
    }

    getFunction(id: string): Function | undefined {
        return this.functions.get(id);
    }

    getAllFunctions(): Map<string, Function> {
        return new Map(this.functions);
    }

    addConnection(outFunctionId: string, inputArgumentId: string): void {
        if (!this.functions.has(outFunctionId) || !this.functions.has(inputArgumentId)) {
            throw new Error('Both source and target functions must exist');
        }
        this.connections.push(new FunctionConnection(outFunctionId, inputArgumentId));
    }

    removeConnection(outFunctionId: string, inputArgumentId: string): void {
        this.connections = this.connections.filter(
            c => !(c.outFunctionId === outFunctionId && c.inputArgumentId === inputArgumentId)
        );
    }

    getAllConnections(): FunctionConnection[] {
        return [...this.connections];
    }

    getOutgoingConnections(functionId: string): FunctionConnection[] {
        return this.connections.filter(c => c.outFunctionId === functionId);
    }

    getIncomingConnections(inputArgumentId: string): FunctionConnection[] {
        return this.connections.filter(c => c.inputArgumentId === inputArgumentId);
    }

    hasLoop(): boolean {
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const hasCycle = (nodeId: string): boolean => {
            visited.add(nodeId);
            recStack.add(nodeId);

            const outgoing = this.getOutgoingConnections(nodeId);
            for (const connection of outgoing) {
                if (!visited.has(connection.inputArgumentId)) {
                    if (hasCycle(connection.inputArgumentId)) return true;
                } else if (recStack.has(connection.inputArgumentId)) {
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
