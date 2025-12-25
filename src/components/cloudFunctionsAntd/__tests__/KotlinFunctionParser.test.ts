import {parseKotlinFunction} from '../api/parseKotlinFunction';

describe('KotlinFunctionParser', () => {
    describe('parseKotlinFunction', () => {
        it('should parse function with no parameters', () => {
            const source = 'fun getValue(): String { return "test" }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('getValue');
            expect(result.arguments).toHaveLength(0);
            expect(result.returnType.name).toBe('String');
            expect(result.returnType.nullable).toBe(false);
            expect(result.state).toBe('idle');
        });

        it('should parse function with single parameter', () => {
            const source = 'fun double(x: Int): Int { return x * 2 }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('double');
            expect(result.arguments).toHaveLength(1);
            expect(result.arguments[0].name).toBe('x');
            expect(result.arguments[0].type.name).toBe('Int');
            expect(result.arguments[0].nullable).toBe(false);
            expect(result.returnType.name).toBe('Int');
            expect(result.state).toBe('idle');
        });

        it('should parse function with multiple parameters', () => {
            const source = 'fun add(a: Int, b: Int, c: Int): Int { return a + b + c }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('add');
            expect(result.arguments).toHaveLength(3);
            expect(result.arguments[0].name).toBe('a');
            expect(result.arguments[1].name).toBe('b');
            expect(result.arguments[2].name).toBe('c');
            expect(result.returnType.name).toBe('Int');
            expect(result.state).toBe('idle');
        });

        it('should parse function with nullable return type', () => {
            const source = 'fun findUser(id: Int): User? { return null }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('findUser');
            expect(result.returnType.name).toBe('User');
            expect(result.returnType.nullable).toBe(true);
            expect(result.state).toBe('idle');
        });

        it('should parse function with nullable parameter', () => {
            const source = 'fun process(data: String?): Boolean { return true }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('process');
            expect(result.arguments).toHaveLength(1);
            expect(result.arguments[0].type.name).toBe('String');
            expect(result.arguments[0].nullable).toBe(true);
            expect(result.state).toBe('idle');
        });

        it('should parse function with Unit return type (implicit)', () => {
            const source = 'fun doSomething() { println("test") }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('doSomething');
            expect(result.returnType.name).toBe('Unit');
            expect(result.returnType.nullable).toBe(false);
            expect(result.state).toBe('idle');
        });

        it('should parse function with Unit return type (explicit)', () => {
            const source = 'fun doSomething(): Unit { println("test") }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('doSomething');
            expect(result.returnType.name).toBe('Unit');
            expect(result.returnType.nullable).toBe(false);
            expect(result.state).toBe('idle');
        });

        it('should parse function with various primitive types', () => {
            const source = 'fun process(flag: Boolean, count: Long, value: Double): Float { return 1.0f }';
            const result = parseKotlinFunction(source);

            expect(result.arguments).toHaveLength(3);
            expect(result.arguments[0].type.name).toBe('Boolean');
            expect(result.arguments[1].type.name).toBe('Long');
            expect(result.arguments[2].type.name).toBe('Double');
            expect(result.returnType.name).toBe('Float');
            expect(result.state).toBe('idle');
        });

        it('should handle extra whitespace', () => {
            const source = 'fun  add  (  a  :  Int  ,  b  :  Int  )  :  Int  { return a + b }';
            const result = parseKotlinFunction(source);

            expect(result.name).toBe('add');
            expect(result.arguments).toHaveLength(2);
            expect(result.returnType.name).toBe('Int');
            expect(result.state).toBe('idle');
        });

        describe('error handling', () => {
            it('should return build-error for missing function keyword', () => {
                const source = 'getValue(): String { return "test" }';
                const result = parseKotlinFunction(source);

                expect(result.name).toBe('parse-error');
                expect(result.returnType.name).toBe('Error');
                expect(result.state).toBe('build-error');
                expect(result.errorMessage).toContain('Missing function name');
            });

            it('should return build-error for invalid parameter format', () => {
                const source = 'fun add(a Int, b: Int): Int { return a + b }';
                const result = parseKotlinFunction(source);

                expect(result.name).toBe('parse-error');
                expect(result.returnType.name).toBe('Error');
                expect(result.state).toBe('build-error');
                expect(result.errorMessage).toContain('Invalid parameter format');
            });

            it('should return build-error for missing parentheses', () => {
                const source = 'fun getValue: String { return "test" }';
                const result = parseKotlinFunction(source);

                expect(result.name).toBe('parse-error');
                expect(result.returnType.name).toBe('Error');
                expect(result.state).toBe('build-error');
                expect(result.errorMessage).toBeDefined();
            });

            it('should preserve original source code in error', () => {
                const source = 'invalid kotlin code';
                const result = parseKotlinFunction(source);

                expect(result.state).toBe('build-error');
                expect(result.sourceCode).toBe(source);
                expect(result.errorMessage).toBeDefined();
            });
        });
    });
});
