import { FunctionCallGraph } from './FunctionCallGraph';
import { FunctionState } from './FunctionData';

export type FunctionStateChangeEvent = {
    functionId: string;
    newState: FunctionState;
};

export class FakeFunctionRunner {
    private graph: FunctionCallGraph;
    private subscribers: Array<(event: FunctionStateChangeEvent) => void>;

    constructor(graph: FunctionCallGraph) {
        this.graph = graph;
        this.subscribers = [];
    }

    subscribeOnFunctionStateChange(callback: (event: FunctionStateChangeEvent) => void): void {
        this.subscribers.push(callback);
    }

    run(functionId: string): void {
        const func = this.graph.getFunction(functionId);

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
            const outgoingCalls = this.graph.getOutgoingCalls(functionId);
            outgoingCalls.forEach(call => {
                const targetFunc = this.graph.getFunction(call.targetId);
                if (targetFunc && targetFunc.state === 'idle') {
                    this.run(call.targetId);
                }
            });
        }, 1000);
    }

    private notifySubscribers(event: FunctionStateChangeEvent): void {
        this.subscribers.forEach(subscriber => subscriber(event));
    }
}
