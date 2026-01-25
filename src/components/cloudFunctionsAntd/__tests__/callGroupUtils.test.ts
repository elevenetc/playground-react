import {computeCallGroups} from '../callGroupUtils';
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

describe('computeCallGroups', () => {
    describe('basic grouping', () => {
        it('should return empty array for no functions', () => {
            const result = computeCallGroups([], []);
            expect(result).toEqual([]);
        });

        it('should create separate groups for disconnected functions', () => {
            const funcA = createFunction('A', 'funcA');
            const funcB = createFunction('B', 'funcB');
            const funcC = createFunction('C', 'funcC');

            const result = computeCallGroups([funcA, funcB, funcC], []);

            expect(result).toHaveLength(3);
            expect(result.map(g => g.functionIds.size)).toEqual([1, 1, 1]);
        });

        it('should group connected functions', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']]);
            const funcC = createFunction('C', 'funcC', [['y', 'String']]);
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('B', 'C', 0)
            ];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(1);
            expect(result[0].functionIds.size).toBe(3);
            expect(result[0].functionIds.has('A')).toBe(true);
            expect(result[0].functionIds.has('B')).toBe(true);
            expect(result[0].functionIds.has('C')).toBe(true);
        });

        it('should handle mixed connected and disconnected functions', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']]);
            const funcC = createFunction('C', 'funcC'); // Disconnected
            const connections = [createConnection('A', 'B', 0)];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(2);
            const groupSizes = result.map(g => g.functionIds.size).sort();
            expect(groupSizes).toEqual([1, 2]);
        });
    });

    describe('root identification', () => {
        it('should identify single root in linear chain', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'idle', 'Int');
            const funcC = createFunction('C', 'funcC', [['y', 'Int']]);
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('B', 'C', 0)
            ];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(1);
            expect(result[0].rootIds).toEqual(['A']);
        });

        it('should identify multiple roots when functions feed into same target', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [], 'idle', 'Int');
            const funcC = createFunction('C', 'funcC', [['x', 'String'], ['y', 'Int']]);
            const connections = [
                createConnection('A', 'C', 0),
                createConnection('B', 'C', 1)
            ];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(1);
            expect(result[0].rootIds.sort()).toEqual(['A', 'B']);
        });

        it('should treat standalone function as its own root', () => {
            const func = createFunction('A', 'funcA');

            const result = computeCallGroups([func], []);

            expect(result).toHaveLength(1);
            expect(result[0].rootIds).toEqual(['A']);
        });

        it('should handle diamond pattern with single root', () => {
            //     B
            //   /   \
            // A       D
            //   \   /
            //     C
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'idle', 'Int');
            const funcC = createFunction('C', 'funcC', [['x', 'String']], 'idle', 'Int');
            const funcD = createFunction('D', 'funcD', [['b', 'Int'], ['c', 'Int']]);
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('A', 'C', 0),
                createConnection('B', 'D', 0),
                createConnection('C', 'D', 1)
            ];

            const result = computeCallGroups([funcA, funcB, funcC, funcD], connections);

            expect(result).toHaveLength(1);
            expect(result[0].rootIds).toEqual(['A']);
        });
    });

    describe('canRun computation', () => {
        it('should return canRun true for standalone idle function', () => {
            const func = createFunction('A', 'funcA', [], 'idle', 'String');

            const result = computeCallGroups([func], []);

            expect(result[0].canRun.can).toBe(true);
        });

        it('should return canRun false when root is not idle', () => {
            const func = createFunction('A', 'funcA', [], 'running', 'String');

            const result = computeCallGroups([func], []);

            expect(result[0].canRun.can).toBe(false);
        });

        it('should return canRun true for fully connected idle chain', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'idle', 'Int');
            const connections = [createConnection('A', 'B', 0)];

            const result = computeCallGroups([funcA, funcB], connections);

            expect(result[0].canRun.can).toBe(true);
        });

        it('should return canRun false when downstream has missing arguments', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String'], ['y', 'Int']]); // Missing second arg
            const connections = [createConnection('A', 'B', 0)];

            const result = computeCallGroups([funcA, funcB], connections);

            expect(result[0].canRun.can).toBe(false);
        });

        it('should return canRun false when any function in chain is not idle', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']], 'running');
            const connections = [createConnection('A', 'B', 0)];

            const result = computeCallGroups([funcA, funcB], connections);

            expect(result[0].canRun.can).toBe(false);
        });
    });

    describe('group id generation', () => {
        it('should generate deterministic id from function ids', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']]);
            const connections = [createConnection('A', 'B', 0)];

            const result1 = computeCallGroups([funcA, funcB], connections);
            const result2 = computeCallGroups([funcB, funcA], connections); // Different order

            expect(result1[0].id).toBe(result2[0].id);
        });
    });

    describe('edge cases', () => {
        it('should handle function with multiple incoming connections', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [], 'idle', 'Int');
            const funcC = createFunction('C', 'funcC', [['x', 'String'], ['y', 'Int']]);
            const connections = [
                createConnection('A', 'C', 0),
                createConnection('B', 'C', 1)
            ];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(1);
            expect(result[0].functionIds.size).toBe(3);
        });

        it('should handle function with multiple outgoing connections', () => {
            const funcA = createFunction('A', 'funcA', [], 'idle', 'String');
            const funcB = createFunction('B', 'funcB', [['x', 'String']]);
            const funcC = createFunction('C', 'funcC', [['y', 'String']]);
            const connections = [
                createConnection('A', 'B', 0),
                createConnection('A', 'C', 0)
            ];

            const result = computeCallGroups([funcA, funcB, funcC], connections);

            expect(result).toHaveLength(1);
            expect(result[0].functionIds.size).toBe(3);
            expect(result[0].rootIds).toEqual(['A']);
        });

        it('should ignore connections referencing non-existent functions', () => {
            const funcA = createFunction('A', 'funcA');
            const connections = [createConnection('A', 'NONEXISTENT', 0)];

            const result = computeCallGroups([funcA], connections);

            expect(result).toHaveLength(1);
            expect(result[0].functionIds.size).toBe(1);
        });
    });
});
