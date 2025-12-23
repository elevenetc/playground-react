import { FakeFunctionRunner, FunctionStateChangeEvent } from './FakeFunctionRunner';
import { FunctionCallGraph } from './FunctionCallGraph';
import { FunctionData } from './FunctionData';

describe('FakeFunctionRunner', () => {
    let graph: FunctionCallGraph;
    let runner: FakeFunctionRunner;
    let func1: FunctionData;
    let func2: FunctionData;
    let func3: FunctionData;

    beforeEach(() => {
        graph = new FunctionCallGraph();
        func1 = new FunctionData('1', 'foo', 'Int', [], 'fun foo(): Int { return 1 }', 'idle');
        func2 = new FunctionData('2', 'bar', 'String', [['x', 'Int']], 'fun bar(x: Int): String { return x.toString() }', 'idle');
        func3 = new FunctionData('3', 'baz', 'Unit', [], 'fun baz() {}', 'idle');

        graph.addFunction(func1);
        graph.addFunction(func2);
        graph.addFunction(func3);

        runner = new FakeFunctionRunner(graph);

        // Use fake timers
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('single idle function transitions to running then back to idle', () => {
        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange((event) => {
            events.push(event);
        });

        runner.run('1');

        // Should start running
        expect(events[0]).toEqual({ functionId: '1', newState: 'running' });

        // After 1s should be idle
        jest.advanceTimersByTime(1000);
        expect(events[1]).toEqual({ functionId: '1', newState: 'idle' });

        expect(events).toHaveLength(2);
    });

    it('two chained functions both execute in sequence', () => {
        graph.addCall('1', '2');

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange((event) => {
            events.push(event);
        });

        runner.run('1');

        // First function starts
        expect(events[0]).toEqual({ functionId: '1', newState: 'running' });

        // After 1s first completes
        jest.advanceTimersByTime(1000);
        expect(events[1]).toEqual({ functionId: '1', newState: 'idle' });

        // Second function starts
        expect(events[2]).toEqual({ functionId: '2', newState: 'running' });

        // After 1s second completes
        jest.advanceTimersByTime(1000);
        expect(events[3]).toEqual({ functionId: '2', newState: 'idle' });

        expect(events).toHaveLength(4);
    });

    it('disconnected function is not called when chained functions run', () => {
        graph.addCall('1', '2');
        // func3 is disconnected

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange((event) => {
            events.push(event);
        });

        runner.run('1');
        jest.runAllTimers();

        // Should only have events for func1 and func2
        const functionIds = events.map(e => e.functionId);
        expect(functionIds).toContain('1');
        expect(functionIds).toContain('2');
        expect(functionIds).not.toContain('3');

        expect(events).toHaveLength(4); // func1: running, idle, func2: running, idle
    });
});
