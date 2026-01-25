import {canRun, CanRunResult, formatCanRunReasons} from '../canRun';
import {Function} from '../Function';
import {FunctionConnection} from '../FunctionConnection';

function createFunction(
    id: string,
    name: string,
    args: [string, string][] = [],
    state: 'idle' | 'running' | 'building' | 'build-error' = 'idle',
    returnType: string = 'Unit'
): Function {
    return {
        id,
        name,
        arguments: new Map(args),
        state,
        returnType,
        sourceCode: `fun ${name}(): ${returnType} { }`
    };
}

function createConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number = 0): FunctionConnection {
    return new FunctionConnection(outFunctionId, targetFunctionId, targetArgIndex);
}

describe('canRun', () => {
    describe('current function checks', () => {
        it('should allow running when function is idle with no arguments', () => {
            const func = createFunction('1', 'start');
            const functions = {'1': func};
            const connections: FunctionConnection[] = [];

            const result = canRun(func, functions, connections);

            expect(result.can).toBe(true);
        });

        it('should not allow running when function is not idle', () => {
            const func = createFunction('1', 'start', [], 'running');
            const functions = {'1': func};
            const connections: FunctionConnection[] = [];

            const result = canRun(func, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toHaveLength(1);
                expect(result.reasons[0]).toEqual({
                    type: 'not-idle',
                    location: 'current',
                    functionId: '1',
                    functionName: 'start',
                    state: 'running'
                });
            }
        });

        it('should not allow running when function has building state', () => {
            const func = createFunction('1', 'start', [], 'building');
            const functions = {'1': func};
            const connections: FunctionConnection[] = [];

            const result = canRun(func, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons[0].type).toBe('not-idle');
                expect(result.reasons[0].location).toBe('current');
            }
        });

        it('should not allow running when function has unconnected arguments', () => {
            const func = createFunction('1', 'process', [['data', 'String'], ['count', 'Int']]);
            const functions = {'1': func};
            const connections: FunctionConnection[] = [];

            const result = canRun(func, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toHaveLength(2);
                expect(result.reasons[0]).toEqual({
                    type: 'missing-argument',
                    location: 'current',
                    functionId: '1',
                    functionName: 'process',
                    argumentName: 'data',
                    argumentIndex: 0
                });
                expect(result.reasons[1]).toEqual({
                    type: 'missing-argument',
                    location: 'current',
                    functionId: '1',
                    functionName: 'process',
                    argumentName: 'count',
                    argumentIndex: 1
                });
            }
        });

        it('should allow running when all arguments are connected', () => {
            const source = createFunction('1', 'source', [], 'idle', 'String');
            const target = createFunction('2', 'process', [['data', 'String']]);
            const functions = {'1': source, '2': target};
            const connections = [createConnection('1', '2', 0)];

            const result = canRun(target, functions, connections);

            expect(result.can).toBe(true);
        });

        it('should detect partially connected arguments', () => {
            const source = createFunction('1', 'source', [], 'idle', 'String');
            const target = createFunction('2', 'process', [['data', 'String'], ['count', 'Int']]);
            const functions = {'1': source, '2': target};
            const connections = [createConnection('1', '2', 0)]; // Only first arg connected

            const result = canRun(target, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toHaveLength(1);
                const reason = result.reasons[0];
                expect(reason.type).toBe('missing-argument');
                if (reason.type === 'missing-argument') {
                    expect(reason.argumentName).toBe('count');
                    expect(reason.argumentIndex).toBe(1);
                }
            }
        });
    });

    describe('upstream function checks', () => {
        it('should not allow running when upstream function is not idle', () => {
            const upstream = createFunction('1', 'source', [], 'running', 'String');
            const current = createFunction('2', 'process', [['data', 'String']]);
            const functions = {'1': upstream, '2': current};
            const connections = [createConnection('1', '2', 0)];

            const result = canRun(current, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toContainEqual({
                    type: 'not-idle',
                    location: 'upstream',
                    functionId: '1',
                    functionName: 'source',
                    state: 'running'
                });
            }
        });

        it('should not allow running when upstream function has missing arguments', () => {
            const upstream = createFunction('1', 'middle', [['input', 'Int']], 'idle', 'String');
            const current = createFunction('2', 'process', [['data', 'String']]);
            const functions = {'1': upstream, '2': current};
            const connections = [createConnection('1', '2', 0)];

            const result = canRun(current, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toContainEqual({
                    type: 'missing-argument',
                    location: 'upstream',
                    functionId: '1',
                    functionName: 'middle',
                    argumentName: 'input',
                    argumentIndex: 0
                });
            }
        });

        it('should check multiple levels of upstream functions', () => {
            const level1 = createFunction('1', 'start', [['x', 'Int']], 'idle', 'String'); // Missing connection
            const level2 = createFunction('2', 'middle', [['data', 'String']], 'idle', 'Int');
            const level3 = createFunction('3', 'end', [['num', 'Int']]);
            const functions = {'1': level1, '2': level2, '3': level3};
            const connections = [
                createConnection('1', '2', 0),
                createConnection('2', '3', 0)
            ];

            const result = canRun(level3, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                // Should find the missing argument in level1
                const upstreamMissing = result.reasons.find(
                    r => r.type === 'missing-argument' && r.functionId === '1'
                );
                expect(upstreamMissing).toBeDefined();
                expect(upstreamMissing?.location).toBe('upstream');
            }
        });
    });

    describe('downstream function checks', () => {
        it('should not allow running when downstream function is not idle', () => {
            const current = createFunction('1', 'source', [], 'idle', 'String');
            const downstream = createFunction('2', 'process', [['data', 'String']], 'running');
            const functions = {'1': current, '2': downstream};
            const connections = [createConnection('1', '2', 0)];

            const result = canRun(current, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toContainEqual({
                    type: 'not-idle',
                    location: 'downstream',
                    functionId: '2',
                    functionName: 'process',
                    state: 'running'
                });
            }
        });

        it('should not allow running when downstream function has missing arguments', () => {
            const current = createFunction('1', 'source', [], 'idle', 'String');
            const downstream = createFunction('2', 'process', [['data', 'String'], ['extra', 'Int']]);
            const functions = {'1': current, '2': downstream};
            const connections = [createConnection('1', '2', 0)]; // Only first arg connected

            const result = canRun(current, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toContainEqual({
                    type: 'missing-argument',
                    location: 'downstream',
                    functionId: '2',
                    functionName: 'process',
                    argumentName: 'extra',
                    argumentIndex: 1
                });
            }
        });

        it('should check multiple levels of downstream functions', () => {
            const level1 = createFunction('1', 'start', [], 'idle', 'String');
            const level2 = createFunction('2', 'middle', [['data', 'String']], 'idle', 'Int');
            const level3 = createFunction('3', 'end', [['num', 'Int'], ['extra', 'String']]); // Missing second arg
            const functions = {'1': level1, '2': level2, '3': level3};
            const connections = [
                createConnection('1', '2', 0),
                createConnection('2', '3', 0)
            ];

            const result = canRun(level1, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                const downstreamMissing = result.reasons.find(
                    r => r.type === 'missing-argument' && r.functionId === '3'
                );
                expect(downstreamMissing).toBeDefined();
                expect(downstreamMissing?.location).toBe('downstream');
            }
        });
    });

    describe('complex chain scenarios', () => {
        it('should handle diamond dependency pattern', () => {
            //     B
            //   /   \
            // A       D
            //   \   /
            //     C
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'idle', 'Int');
            const funcC = createFunction('C', 'funcC', [['x', 'String']], 'idle', 'Int');
            const funcD = createFunction('D', 'funcD', [['b', 'Int'], ['c', 'Int']]);
            const functions = {'A': funcA, 'B': funcB, 'C': funcC, 'D': funcD};
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('A', 'C', 0),
                createConnection('B', 'D', 0),
                createConnection('C', 'D', 1)
            ];

            const result = canRun(funcA, functions, connections);

            expect(result.can).toBe(true);
        });

        it('should detect issues in diamond pattern', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'running', 'Int'); // Not idle
            const funcC = createFunction('C', 'funcC', [['x', 'String']], 'idle', 'Int');
            const funcD = createFunction('D', 'funcD', [['b', 'Int'], ['c', 'Int']]);
            const functions = {'A': funcA, 'B': funcB, 'C': funcC, 'D': funcD};
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('A', 'C', 0),
                createConnection('B', 'D', 0),
                createConnection('C', 'D', 1)
            ];

            const result = canRun(funcA, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                expect(result.reasons).toContainEqual({
                    type: 'not-idle',
                    location: 'downstream',
                    functionId: 'B',
                    functionName: 'funcB',
                    state: 'running'
                });
            }
        });

        it('should handle function with no connections (standalone)', () => {
            const func = createFunction('1', 'standalone', [], 'idle', 'String');
            const functions = {'1': func};
            const connections: FunctionConnection[] = [];

            const result = canRun(func, functions, connections);

            expect(result.can).toBe(true);
        });

        it('should collect multiple reasons from different locations', () => {
            const upstream = createFunction('1', 'upstream', [['x', 'Int']], 'running', 'String'); // running + missing arg
            const current = createFunction('2', 'current', [['data', 'String'], ['extra', 'Boolean']], 'idle'); // missing second arg
            const downstream = createFunction('3', 'downstream', [['result', 'Unit']], 'building'); // building state
            const functions = {'1': upstream, '2': current, '3': downstream};
            const connections = [
                createConnection('1', '2', 0),
                createConnection('2', '3', 0)
            ];

            const result = canRun(current, functions, connections);

            expect(result.can).toBe(false);
            if (!result.can) {
                // Should have reasons from all three locations
                const locations = new Set(result.reasons.map(r => r.location));
                expect(locations.has('current')).toBe(true);
                expect(locations.has('upstream')).toBe(true);
                expect(locations.has('downstream')).toBe(true);
            }
        });

        it('should not visit same function twice (cycle prevention)', () => {
            // This shouldn't cause infinite loop even with artificial cycle
            const func1 = createFunction('1', 'func1', [['x', 'String']], 'idle', 'String');
            const func2 = createFunction('2', 'func2', [['y', 'String']], 'idle', 'String');
            const functions = {'1': func1, '2': func2};
            // Create a cycle: 1 -> 2 -> 1 (artificial, shouldn't happen in real usage)
            const connections = [
                createConnection('1', '2', 0),
                createConnection('2', '1', 0)
            ];

            // Should complete without infinite loop
            const result = canRun(func1, functions, connections);

            // Both functions have their args connected by each other, so should be runnable
            expect(result.can).toBe(true);
        });
    });

    describe('formatCanRunReasons', () => {
        it('should format not-idle reason for current function', () => {
            const result: CanRunResult = {
                can: false,
                reasons: [{
                    type: 'not-idle',
                    location: 'current',
                    functionId: '1',
                    functionName: 'test',
                    state: 'running'
                }]
            };

            const formatted = formatCanRunReasons(result.reasons);

            expect(formatted).toBe('Function "test" is running');
        });

        it('should format missing-argument reason for upstream function', () => {
            const result: CanRunResult = {
                can: false,
                reasons: [{
                    type: 'missing-argument',
                    location: 'upstream',
                    functionId: '1',
                    functionName: 'source',
                    argumentName: 'data',
                    argumentIndex: 0
                }]
            };

            const formatted = formatCanRunReasons(result.reasons);

            expect(formatted).toBe('Upstream function "source" has unconnected argument "data"');
        });

        it('should format reason for downstream function', () => {
            const result: CanRunResult = {
                can: false,
                reasons: [{
                    type: 'not-idle',
                    location: 'downstream',
                    functionId: '1',
                    functionName: 'sink',
                    state: 'building'
                }]
            };

            const formatted = formatCanRunReasons(result.reasons);

            expect(formatted).toBe('Downstream function "sink" is building');
        });

        it('should join multiple reasons with semicolon', () => {
            const result: CanRunResult = {
                can: false,
                reasons: [
                    {
                        type: 'not-idle',
                        location: 'current',
                        functionId: '1',
                        functionName: 'test',
                        state: 'running'
                    },
                    {
                        type: 'missing-argument',
                        location: 'upstream',
                        functionId: '2',
                        functionName: 'source',
                        argumentName: 'x',
                        argumentIndex: 0
                    }
                ]
            };

            const formatted = formatCanRunReasons(result.reasons);

            expect(formatted).toBe('Function "test" is running; Upstream function "source" has unconnected argument "x"');
        });
    });
});
