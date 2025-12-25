import {Project} from '../Project';
import {Function} from '../Function';

describe('Project', () => {
    let graph: Project;
    let func1: Function;
    let func2: Function;
    let func3: Function;

    beforeEach(() => {
        graph = new Project();
        func1 = new Function('1', 'foo', [], 'Int', 'fun foo(): Int { return 1 }');
        func2 = new Function('2', 'bar', [['x', 'Int']], 'String', 'fun bar(x: Int): String { return x.toString() }');
        func3 = new Function('3', 'baz', [], 'Unit', 'fun baz() {}');
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
            graph.addConnection('1', '2');
            graph.removeFunction('1');
            expect(graph.getAllConnections()).toHaveLength(0);
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
            graph.addConnection('1', '2');
            expect(graph.getAllConnections()).toHaveLength(1);
        });

        it('should throw error if source function does not exist', () => {
            graph.addFunction(func2);
            expect(() => graph.addConnection('999', '2')).toThrow('Both source and target functions must exist');
        });

        it('should throw error if target function does not exist', () => {
            graph.addFunction(func1);
            expect(() => graph.addConnection('1', '999')).toThrow('Both source and target functions must exist');
        });
    });

    describe('removeCall', () => {
        it('should remove a call', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addConnection('1', '2');
            graph.removeConnection('1', '2');
            expect(graph.getAllConnections()).toHaveLength(0);
        });

        it('should only remove the specified call', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addConnection('1', '2');
            graph.addConnection('2', '3');
            graph.removeConnection('1', '2');
            expect(graph.getAllConnections()).toHaveLength(1);
            expect(graph.getAllConnections()[0].outFunctionId).toBe('2');
            expect(graph.getAllConnections()[0].inputArgumentId).toBe('3');
        });
    });

    describe('getOutgoingCalls', () => {
        it('should return empty array for function with no outgoing calls', () => {
            graph.addFunction(func1);
            expect(graph.getOutgoingConnections('1')).toHaveLength(0);
        });

        it('should return all outgoing calls', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addConnection('1', '2');
            graph.addConnection('1', '3');
            const outgoing = graph.getOutgoingConnections('1');
            expect(outgoing).toHaveLength(2);
        });
    });

    describe('getIncomingCalls', () => {
        it('should return empty array for function with no incoming calls', () => {
            graph.addFunction(func1);
            expect(graph.getIncomingConnections('1')).toHaveLength(0);
        });

        it('should return all incoming calls', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addConnection('1', '3');
            graph.addConnection('2', '3');
            const incoming = graph.getIncomingConnections('3');
            expect(incoming).toHaveLength(2);
        });
    });

    describe('hasLoop', () => {
        it('should return false for graph with no loops', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addConnection('1', '2');
            graph.addConnection('2', '3');
            expect(graph.hasLoop()).toBe(false);
        });

        it('should return true for simple loop', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addConnection('1', '2');
            graph.addConnection('2', '1');
            expect(graph.hasLoop()).toBe(true);
        });

        it('should return true for complex loop', () => {
            graph.addFunction(func1);
            graph.addFunction(func2);
            graph.addFunction(func3);
            graph.addConnection('1', '2');
            graph.addConnection('2', '3');
            graph.addConnection('3', '1');
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
