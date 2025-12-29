import {Function, FunctionState} from './Function';
import {FunctionConnection} from './FunctionConnection';

export type FunctionStateChangeEvent = {
    functionId: string;
    newState: FunctionState;
};

export class FakeFunctionRunner {
    private functions: Map<string, Function>;
    private connections: FunctionConnection[];
    private subscribers: Array<(event: FunctionStateChangeEvent) => void>;

    constructor(functions: Map<string, Function>, connections: FunctionConnection[]) {
        this.functions = functions;
        this.connections = connections;
        this.subscribers = [];
    }

    subscribeOnFunctionStateChange(callback: (event: FunctionStateChangeEvent) => void): void {
        this.subscribers.push(callback);
    }

    run(functionId: string): void {
        const func = this.functions.get(functionId);

        if (!func) {
            throw new Error(`Function with id ${functionId} not found`);
        }

        if (func.state !== 'idle') {
            throw new Error(`Function ${functionId} is not idle (current state: ${func.state})`);
        }

        // Start running immediately
        this.notifySubscribers({ functionId, newState: 'running' });

        // Simulate function execution for 1 second
        setTimeout(() => {
            this.notifySubscribers({ functionId, newState: 'idle' });

            // Check for outgoing calls and run them
            const outgoingCalls = this.connections.filter(conn => conn.outFunctionId === functionId);
            outgoingCalls.forEach(call => {
                const targetFunc = this.functions.get(call.inputArgumentId);
                if (targetFunc && targetFunc.state === 'idle') {
                    this.run(call.inputArgumentId);
                }
            });
        }, 1000);
    }

    private notifySubscribers(event: FunctionStateChangeEvent): void {
        this.subscribers.forEach(subscriber => subscriber(event));
    }
}
