import {canBeConnected} from '../canBeConnected';
import type {Function} from '../Function';
import {createFunction} from './testHelpers';

describe('canBeConnected', () => {
    let functions: Record<string, Function>;

    beforeEach(() => {
        functions = {};
    });

    test('should allow connection when types match', () => {
        const func1 = createFunction('1', 'getNumber', [], 'Int', 'fun getNumber(): Int { return 42 }');
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(true);
    });

    test('should reject connection when types do not match', () => {
        const func1 = createFunction('1', 'getString', [], 'String', 'fun getString(): String { return "hello" }');
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(false);
    });

    test('should reject connection when output function does not exist', () => {
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['2'] = func2;

        expect(canBeConnected(functions, '999', '2', 0)).toBe(false);
    });

    test('should reject connection when input function does not exist', () => {
        const func1 = createFunction('1', 'getNumber', [], 'Int', 'fun getNumber(): Int { return 42 }');

        functions['1'] = func1;

        expect(canBeConnected(functions, '1', '999', 0)).toBe(false);
    });

    test('should reject connection when output function returns Unit', () => {
        const func1 = createFunction('1', 'doSomething', [], 'Unit', 'fun doSomething() { println("test") }');
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(false);
    });

    test('should reject connection when argument index is negative', () => {
        const func1 = createFunction('1', 'getNumber', [], 'Int', 'fun getNumber(): Int { return 42 }');
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', -1)).toBe(false);
    });

    test('should reject connection when argument index is out of bounds', () => {
        const func1 = createFunction('1', 'getNumber', [], 'Int', 'fun getNumber(): Int { return 42 }');
        const func2 = createFunction('2', 'processNumber', [['num', 'Int']], 'String', 'fun processNumber(num: Int): String { return num.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 5)).toBe(false);
    });

    test('should allow connection to correct argument when function has multiple arguments', () => {
        const func1 = createFunction('1', 'getString', [], 'String', 'fun getString(): String { return "hello" }');
        const func2 = createFunction('2', 'process', [['num', 'Int'], ['text', 'String'], ['flag', 'Boolean']], 'String', 'fun process(num: Int, text: String, flag: Boolean): String { return text }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(false); // String -> Int (mismatch)
        expect(canBeConnected(functions, '1', '2', 1)).toBe(true);  // String -> String (match)
        expect(canBeConnected(functions, '1', '2', 2)).toBe(false); // String -> Boolean (mismatch)
    });

    test('should handle complex types', () => {
        const func1 = createFunction('1', 'getList', [], 'List<Int>', 'fun getList(): List<Int> { return listOf(1, 2, 3) }');
        const func2 = createFunction('2', 'processData', [['data', 'List<Int>']], 'String', 'fun processData(data: List<Int>): String { return data.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(true);
    });

    test('should reject connection between complex types that do not match', () => {
        const func1 = createFunction('1', 'getList', [], 'List<Int>', 'fun getList(): List<Int> { return listOf(1, 2, 3) }');
        const func2 = createFunction('2', 'processData', [['data', 'List<String>']], 'String', 'fun processData(data: List<String>): String { return data.toString() }');

        functions['1'] = func1;
        functions['2'] = func2;

        expect(canBeConnected(functions, '1', '2', 0)).toBe(false);
    });
});
