import { FunctionCallGraph } from './FunctionCallGraph';
import { FunctionData } from './FunctionData';

describe('FunctionCallGraph', () => {
    let graph: FunctionCallGraph;
    let func1: FunctionData;
    let func2: FunctionData;
    let func3: FunctionData;

    beforeEach(() => {
        graph = new FunctionCallGraph();
        func1 = new FunctionData('1', 'foo', 'Int', [], 'fun foo(): Int { return 1 }');
        func2 = new FunctionData('2', 'bar', 'String', [['x', 'Int']], 'fun bar(x: Int): String { return x.toString() }');
        func3 = new FunctionData('3', 'baz', 'Unit', [], 'fun baz() {}');
    });

    describe('addFunction', () => {
        it('should add a function to the graph', () => {
            graph.addFunction(func1);
            expect(graph.getFunction('1')).toBe(func1);
        });

        it('should add multiple functions', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            expect(graph.getAllFunctions().size).toBe(2);
        });
    });

    describe('removeFunction', () => {
        it('should remove a function from the graph', () => {
            graph.addFunction(func1);
            graph.removeFunction('1');
            expect(graph.getFunction('1')).toBeUndefined();
        });

        it('should remove associated calls when removing a function', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addCall('1', '2');
            graph.removeFunction('1');
            expect(graph.getAllCalls()).toHaveLength(0);
        });
    });

    describe('getFunction', () => {
        it('should return undefined for non-existent function', () => {
            expect(graph.getFunction('999')).toBeUndefined();
        });

        it('should return the correct function', () => {
            graph.addFunction(func1);
            expect(graph.getFunction('1')).toBe(func1);
        });
    });

    describe('getAllFunctions', () => {
        it('should return empty map for empty graph', () => {
            expect(graph.getAllFunctions().size).toBe(0);
        });

        it('should return all functions', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            const allFunctions = graph.getAllFunctions();
            expect(allFunctions.size).toBe(2);
            expect(allFunctions.get('1')).toBe(func1);
            expect(allFunctions.get('2')).toBe(func2);
        });
    });

    describe('addCall', () => {
        it('should add a call between two functions', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addCall('1', '2');
            expect(graph.getAllCalls()).toHaveLength(1);
        });

        it('should throw error if source function does not exist', () => {
            graph.addFunction(func2);
            expect(() => graph.addCall('999', '2')).toThrow('Both source and target functions must exist');
        });

        it('should throw error if target function does not exist', () => {
            graph.addFunction(func1);
            expect(() => graph.addCall('1', '999')).toThrow('Both source and target functions must exist');
        });
    });

    describe('removeCall', () => {
        it('should remove a call', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addCall('1', '2');
            graph.removeCall('1', '2');
            expect(graph.getAllCalls()).toHaveLength(0);
        });

        it('should only remove the specified call', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addCall('1', '2');
            graph.addCall('2', '3');
            graph.removeCall('1', '2');
            expect(graph.getAllCalls()).toHaveLength(1);
            expect(graph.getAllCalls()[0].sourceId).toBe('2');
            expect(graph.getAllCalls()[0].targetId).toBe('3');
        });
    });

    describe('getOutgoingCalls', () => {
        it('should return empty array for function with no outgoing calls', () => {
            graph.addFunction(func1);
            expect(graph.getOutgoingCalls('1')).toHaveLength(0);
        });

        it('should return all outgoing calls', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addCall('1', '2');
            graph.addCall('1', '3');
            const outgoing = graph.getOutgoingCalls('1');
            expect(outgoing).toHaveLength(2);
        });
    });

    describe('getIncomingCalls', () => {
        it('should return empty array for function with no incoming calls', () => {
            graph.addFunction(func1);
            expect(graph.getIncomingCalls('1')).toHaveLength(0);
        });

        it('should return all incoming calls', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addCall('1', '3');
            graph.addCall('2', '3');
            const incoming = graph.getIncomingCalls('3');
            expect(incoming).toHaveLength(2);
        });
    });

    describe('hasLoop', () => {
        it('should return false for graph with no loops', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addCall('1', '2');
            graph.addCall('2', '3');
            expect(graph.hasLoop()).toBe(false);
        });

        it('should return true for simple loop', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addCall('1', '2');
            graph.addCall('2', '1');
            expect(graph.hasLoop()).toBe(true);
        });

        it('should return true for complex loop', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addCall('1', '2');
            graph.addCall('2', '3');
            graph.addCall('3', '1');
            expect(graph.hasLoop()).toBe(true);
        });

        it('should return false for empty graph', () => {
            expect(graph.hasLoop()).toBe(false);
        });

        it('should return false for single node', () => {
            graph.addFunction(func1);
            expect(graph.hasLoop()).toBe(false);
        });
    });
});
