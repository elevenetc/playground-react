import {evaluateKotlinFunction, translateKotlinToJs} from '../kotlinToJs';

describe('kotlinToJs', () => {
    describe('translateKotlinToJs', () => {
        it('should translate simple addition', () => {
            const source = 'fun add(a: Int, b: Int): Int { return a + b }';
            const result = translateKotlinToJs(source, ['a', 'b']);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return a + b;');
            }
        });

        it('should translate expression body syntax', () => {
            const source = 'fun add(a: Int, b: Int): Int = a + b';
            const result = translateKotlinToJs(source, ['a', 'b']);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return a + b;');
            }
        });

        it('should translate multiplication', () => {
            const source = 'fun double(x: Int): Int { return x * 2 }';
            const result = translateKotlinToJs(source, ['x']);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return x * 2;');
            }
        });

        it('should handle Float literals', () => {
            const source = 'fun getFloat(): Float { return 1.5f }';
            const result = translateKotlinToJs(source, []);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return 1.5;');
            }
        });

        it('should handle Long literals', () => {
            const source = 'fun getLong(): Long { return 100L }';
            const result = translateKotlinToJs(source, []);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return 100;');
            }
        });

        it('should handle string templates', () => {
            const source = 'fun greet(name: String): String { return "Hello $name" }';
            const result = translateKotlinToJs(source, ['name']);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return `Hello ${name}`;');
            }
        });

        it('should fail on invalid source', () => {
            const source = 'invalid kotlin';
            const result = translateKotlinToJs(source, []);

            expect(result.success).toBe(false);
        });

        it('should translate println to console.log', () => {
            const source = 'fun log(msg: String): Unit { println(msg) }';
            const result = translateKotlinToJs(source, ['msg']);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.jsCode).toBe('return console.log(msg);');
            }
        });
    });

    describe('evaluateKotlinFunction', () => {
        it('should evaluate addition', () => {
            const source = 'fun add(a: Int, b: Int): Int { return a + b }';
            const result = evaluateKotlinFunction(source, ['a', 'b'], [3, 5]);

            expect(result).toBe(8);
        });

        it('should evaluate multiplication', () => {
            const source = 'fun double(x: Int): Int { return x * 2 }';
            const result = evaluateKotlinFunction(source, ['x'], [7]);

            expect(result).toBe(14);
        });

        it('should evaluate expression body', () => {
            const source = 'fun subtract(a: Int, b: Int): Int = a - b';
            const result = evaluateKotlinFunction(source, ['a', 'b'], [10, 4]);

            expect(result).toBe(6);
        });

        it('should evaluate division', () => {
            const source = 'fun divide(a: Int, b: Int): Int { return a / b }';
            const result = evaluateKotlinFunction(source, ['a', 'b'], [20, 4]);

            expect(result).toBe(5);
        });

        it('should evaluate modulo', () => {
            const source = 'fun mod(a: Int, b: Int): Int { return a % b }';
            const result = evaluateKotlinFunction(source, ['a', 'b'], [17, 5]);

            expect(result).toBe(2);
        });

        it('should evaluate boolean operations', () => {
            const source = 'fun isPositive(x: Int): Boolean { return x > 0 }';
            const result = evaluateKotlinFunction(source, ['x'], [5]);

            expect(result).toBe(true);
        });

        it('should evaluate string concatenation', () => {
            const source = 'fun concat(a: String, b: String): String { return a + b }';
            const result = evaluateKotlinFunction(source, ['a', 'b'], ['Hello', ' World']);

            expect(result).toBe('Hello World');
        });

        it('should evaluate complex arithmetic', () => {
            const source = 'fun calc(a: Int, b: Int, c: Int): Int { return a + b * c }';
            const result = evaluateKotlinFunction(source, ['a', 'b', 'c'], [1, 2, 3]);

            expect(result).toBe(7); // 1 + (2 * 3) = 7
        });

        it('should evaluate no-param function', () => {
            const source = 'fun getAnswer(): Int { return 42 }';
            const result = evaluateKotlinFunction(source, [], []);

            expect(result).toBe(42);
        });

        it('should evaluate Float return', () => {
            const source = 'fun half(x: Double): Double { return x / 2 }';
            const result = evaluateKotlinFunction(source, ['x'], [10]);

            expect(result).toBe(5);
        });
    });
});
