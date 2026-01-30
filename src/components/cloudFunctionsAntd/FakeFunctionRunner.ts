import {Function, FunctionState} from './Function';
import {FunctionConnection} from './FunctionConnection';
import {evaluateKotlinFunction} from './kotlinToJs';
import {canRun, formatCanRunReasons} from './canRun';

export type FunctionExecutionEvent =
    | { type: 'state-change'; functionId: string; functionName: string; newState: FunctionState }
    | { type: 'function-start'; functionId: string; functionName: string; parameters: Record<string, unknown> }
    | { type: 'function-end'; functionId: string; functionName: string; returnValue: unknown; error?: string };

export type FunctionStateChangeEvent = {
    functionId: string;
    newState: FunctionState;
    result?: unknown;
    error?: string;
};

type RunContext = {
    runId: string;
    pendingFunctions: Set<string>;
    onComplete: () => void;
};

export class FakeFunctionRunner {
    private functions: Map<string, Function>;
    private connections: FunctionConnection[];
    private stateSubscribers: Array<(event: FunctionStateChangeEvent) => void>;
    private executionSubscribers: Array<(event: FunctionExecutionEvent) => void>;
    private functionResults: Map<string, unknown>;
    private functionInputs: Map<string, Map<number, unknown>>;
    private pendingInputs: Map<string, Set<number>>;
    private activeRun: RunContext | null = null;

    constructor(functions: Map<string, Function>, connections: FunctionConnection[]) {
        this.functions = functions;
        this.connections = connections;
        this.stateSubscribers = [];
        this.executionSubscribers = [];
        this.functionResults = new Map();
        this.functionInputs = new Map();
        this.pendingInputs = new Map();
    }

    subscribeOnFunctionStateChange(callback: (event: FunctionStateChangeEvent) => void): void {
        this.stateSubscribers.push(callback);
    }

    subscribeOnExecution(callback: (event: FunctionExecutionEvent) => void): void {
        this.executionSubscribers.push(callback);
    }

    setInput(functionId: string, argIndex: number, value: unknown): void {
        if (!this.functionInputs.has(functionId)) {
            this.functionInputs.set(functionId, new Map());
        }
        this.functionInputs.get(functionId)!.set(argIndex, value);

        this.pendingInputs.get(functionId)?.delete(argIndex);
    }

    getResult(functionId: string): unknown {
        return this.functionResults.get(functionId);
    }

    run(functionId: string, onComplete?: () => void): string {
        const func = this.functions.get(functionId);
        if (!func) {
            throw new Error(`Function with id ${functionId} not found`);
        }

        const functionsRecord = Object.fromEntries(this.functions);
        const canRunResult = canRun(func, functionsRecord, this.connections);

        if (!canRunResult.can) {
            throw new Error(`Cannot run: ${formatCanRunReasons(canRunResult.reasons)}`);
        }

        const runId = crypto.randomUUID();
        const connectedFunctions = this.collectConnectedFunctions(functionId);

        this.activeRun = {
            runId,
            pendingFunctions: new Set(connectedFunctions),
            onComplete: onComplete || (() => {
            })
        };

        const rootIds = this.findRootsForFunction(functionId);
        this.initializePendingInputs();

        for (const rootId of rootIds) {
            this.executeFunction(rootId);
        }

        return runId;
    }

    private findRootsForFunction(functionId: string): string[] {
        const connectedIds = this.collectConnectedFunctions(functionId);
        const hasIncoming = new Set<string>();

        for (const conn of this.connections) {
            if (connectedIds.has(conn.outFunctionId) && connectedIds.has(conn.targetFunctionId)) {
                hasIncoming.add(conn.targetFunctionId);
            }
        }

        return Array.from(connectedIds).filter(id => !hasIncoming.has(id));
    }

    private collectConnectedFunctions(startId: string): Set<string> {
        const connected = new Set<string>();
        const queue = [startId];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (connected.has(currentId)) continue;
            connected.add(currentId);

            for (const conn of this.connections) {
                if (conn.outFunctionId === currentId && !connected.has(conn.targetFunctionId)) {
                    queue.push(conn.targetFunctionId);
                }
                if (conn.targetFunctionId === currentId && !connected.has(conn.outFunctionId)) {
                    queue.push(conn.outFunctionId);
                }
            }
        }

        return connected;
    }

    private initializePendingInputs(): void {
        this.pendingInputs.clear();

        for (const [funcId, func] of this.functions) {
            const argCount = func.arguments.size;
            if (argCount > 0) {
                const pending = new Set<number>();
                for (let i = 0; i < argCount; i++) {
                    const hasConnection = this.connections.some(
                        c => c.targetFunctionId === funcId && c.targetArgIndex === i
                    );
                    if (hasConnection && !this.functionInputs.get(funcId)?.has(i)) {
                        pending.add(i);
                    }
                }
                if (pending.size > 0) {
                    this.pendingInputs.set(funcId, pending);
                }
            }
        }
    }

    private canExecute(functionId: string): boolean {
        const pending = this.pendingInputs.get(functionId);
        return !pending || pending.size === 0;
    }

    private executeFunction(functionId: string): void {
        const func = this.functions.get(functionId);
        if (!func || func.state !== 'idle') return;
        if (!this.canExecute(functionId)) return;

        const parameters = this.getParametersForFunction(func);

        this.notifyStateSubscribers({functionId, newState: 'running'});
        this.notifyExecutionSubscribers({
            type: 'function-start',
            functionId,
            functionName: func.name,
            parameters
        });

        setTimeout(() => {
            try {
                const result = this.evaluateFunction(func);
                this.functionResults.set(functionId, result);

                this.notifyExecutionSubscribers({
                    type: 'function-end',
                    functionId,
                    functionName: func.name,
                    returnValue: result
                });
                this.notifyStateSubscribers({functionId, newState: 'idle', result});

                this.markFunctionComplete(functionId);
                this.propagateResult(functionId, result);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                this.notifyExecutionSubscribers({
                    type: 'function-end',
                    functionId,
                    functionName: func.name,
                    returnValue: undefined,
                    error: errorMessage
                });
                this.notifyStateSubscribers({functionId, newState: 'idle', error: errorMessage});

                this.markFunctionComplete(functionId);
            }
        }, 100);
    }

    private getParametersForFunction(func: Function): Record<string, unknown> {
        const paramNames = Array.from(func.arguments.keys());
        const inputs = this.functionInputs.get(func.id) || new Map();
        const parameters: Record<string, unknown> = {};

        paramNames.forEach((name, index) => {
            const value = inputs.get(index);
            parameters[name] = value !== undefined ? value : getDefaultValue(func.arguments.get(name)!);
        });

        return parameters;
    }

    private evaluateFunction(func: Function): unknown {
        const paramNames = Array.from(func.arguments.keys());
        const inputs = this.functionInputs.get(func.id) || new Map();

        const paramValues = paramNames.map((name, index) => {
            const value = inputs.get(index);
            return value !== undefined ? value : getDefaultValue(func.arguments.get(name)!);
        });

        return evaluateKotlinFunction(func.sourceCode, paramNames, paramValues);
    }

    private markFunctionComplete(functionId: string): void {
        if (this.activeRun) {
            this.activeRun.pendingFunctions.delete(functionId);
            if (this.activeRun.pendingFunctions.size === 0) {
                this.activeRun.onComplete();
                this.activeRun = null;
            }
        }
    }

    private propagateResult(functionId: string, result: unknown): void {
        const outgoingConnections = this.connections.filter(c => c.outFunctionId === functionId);

        for (const conn of outgoingConnections) {
            this.setInput(conn.targetFunctionId, conn.targetArgIndex, result);

            if (this.canExecute(conn.targetFunctionId)) {
                const targetFunc = this.functions.get(conn.targetFunctionId);
                if (targetFunc && targetFunc.state === 'idle') {
                    this.executeFunction(conn.targetFunctionId);
                }
            }
        }
    }

    private notifyStateSubscribers(event: FunctionStateChangeEvent): void {
        this.stateSubscribers.forEach(subscriber => subscriber(event));
    }

    private notifyExecutionSubscribers(event: FunctionExecutionEvent): void {
        this.executionSubscribers.forEach(subscriber => subscriber(event));
    }
}

function getDefaultValue(typeName: string): unknown {
    switch (typeName) {
        case 'Int':
        case 'Long':
        case 'Short':
        case 'Byte':
            return 0;
        case 'Float':
        case 'Double':
            return 0.0;
        case 'Boolean':
            return false;
        case 'String':
            return '';
        case 'Char':
            return '';
        default:
            return null;
    }
}
