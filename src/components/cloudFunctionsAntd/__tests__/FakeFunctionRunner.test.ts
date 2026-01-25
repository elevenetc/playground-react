import {FakeFunctionRunner, FunctionStateChangeEvent} from '../FakeFunctionRunner';
import type {Function} from '../Function';
import {FunctionConnection} from '../FunctionConnection';
import {createFunction} from './testHelpers';

describe('FakeFunctionRunner', () => {
    let functions: Map<string, Function>;
    let connections: FunctionConnection[];
    let runner: FakeFunctionRunner;
    let func1: Function;
    let func2: Function;
    let func3: Function;

    beforeEach(() => {
        functions = new Map();
        connections = [];
        func1 = createFunction('1', 'foo', [], 'Int', 'fun foo(): Int { return 1 }');
        func2 = createFunction('2', 'bar', [['x', 'Int']], 'String', 'fun bar(x: Int): String { return x.toString() }');
        func3 = createFunction('3', 'baz', [], 'Unit', 'fun baz() {}');

        functions.set(func1.id, func1);
        functions.set(func2.id, func2);
        functions.set(func3.id, func3);

        runner = new FakeFunctionRunner(functions, connections);

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
        expect(events[0]).toEqual({functionId: '1', newState: 'running'});

        // After execution should be idle with result
        jest.advanceTimersByTime(100);
        expect(events[1]).toEqual({functionId: '1', newState: 'idle', result: 1});

        expect(events).toHaveLength(2);
    });

    it('two chained functions both execute in sequence', () => {
        connections.push(new FunctionConnection('1', '2'));

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange((event) => {
            events.push(event);
        });

        runner.run('1');

        // First function starts
        expect(events[0]).toEqual({functionId: '1', newState: 'running'});

        // After execution first completes with result
        jest.advanceTimersByTime(100);
        expect(events[1]).toEqual({functionId: '1', newState: 'idle', result: 1});

        // Second function starts (receives result from first)
        expect(events[2]).toEqual({functionId: '2', newState: 'running'});

        // After execution second completes with result
        jest.advanceTimersByTime(100);
        expect(events[3]).toEqual({functionId: '2', newState: 'idle', result: '1'});

        expect(events).toHaveLength(4);
    });

    it('disconnected function is not called when chained functions run', () => {
        connections.push(new FunctionConnection('1', '2'));
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

    it('throws error when function has unconnected arguments', () => {
        // func2 has argument 'x' but no connection
        expect(() => runner.run('2')).toThrow('Cannot run');
        expect(() => runner.run('2')).toThrow('unconnected argument');
    });

    it('executes diamond pattern correctly', () => {
        // A -> B -> D
        // A -> C -> D
        const funcA = createFunction('A', 'getNum', [], 'Int', 'fun getNum(): Int { return 10 }');
        const funcB = createFunction('B', 'double', [['x', 'Int']], 'Int', 'fun double(x: Int): Int { return x * 2 }');
        const funcC = createFunction('C', 'triple', [['x', 'Int']], 'Int', 'fun triple(x: Int): Int { return x * 3 }');
        const funcD = createFunction('D', 'add', [['a', 'Int'], ['b', 'Int']], 'Int', 'fun add(a: Int, b: Int): Int { return a + b }');

        functions.clear();
        functions.set('A', funcA);
        functions.set('B', funcB);
        functions.set('C', funcC);
        functions.set('D', funcD);

        connections.length = 0;
        connections.push(new FunctionConnection('A', 'B', 0));
        connections.push(new FunctionConnection('A', 'C', 0));
        connections.push(new FunctionConnection('B', 'D', 0));
        connections.push(new FunctionConnection('C', 'D', 1));

        runner = new FakeFunctionRunner(functions, connections);

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange(e => events.push(e));

        runner.run('D');
        jest.runAllTimers();

        // A produces 10
        // B receives 10, produces 20
        // C receives 10, produces 30
        // D receives 20 and 30, produces 50
        const dResult = events.find(e => e.functionId === 'D' && e.newState === 'idle');
        expect(dResult?.result).toBe(50);
    });

    it('starts from root when run is called on middle function', () => {
        connections.push(new FunctionConnection('1', '2'));

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange(e => events.push(e));

        // Run on func2, but func1 should start first as it's the root
        runner.run('2');

        expect(events[0]).toEqual({functionId: '1', newState: 'running'});

        jest.runAllTimers();

        // Both should execute
        const functionIds = events.map(e => e.functionId);
        expect(functionIds).toContain('1');
        expect(functionIds).toContain('2');
    });

    it('waits for all inputs before executing function with multiple arguments', () => {
        const source1 = createFunction('s1', 'getA', [], 'Int', 'fun getA(): Int { return 5 }');
        const source2 = createFunction('s2', 'getB', [], 'Int', 'fun getB(): Int { return 3 }');
        const target = createFunction('t', 'multiply', [['a', 'Int'], ['b', 'Int']], 'Int', 'fun multiply(a: Int, b: Int): Int { return a * b }');

        functions.clear();
        functions.set('s1', source1);
        functions.set('s2', source2);
        functions.set('t', target);

        connections.length = 0;
        connections.push(new FunctionConnection('s1', 't', 0));
        connections.push(new FunctionConnection('s2', 't', 1));

        runner = new FakeFunctionRunner(functions, connections);

        const events: FunctionStateChangeEvent[] = [];
        runner.subscribeOnFunctionStateChange(e => events.push(e));

        runner.run('t');

        // Both sources start immediately (they are roots)
        expect(events.filter(e => e.newState === 'running').map(e => e.functionId).sort())
            .toEqual(['s1', 's2']);

        jest.runAllTimers();

        // Target should execute after both sources complete
        const targetResult = events.find(e => e.functionId === 't' && e.newState === 'idle');
        expect(targetResult?.result).toBe(15); // 5 * 3
    });
});
