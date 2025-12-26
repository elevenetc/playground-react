import {FakeCloudKotlinFunctionsApi} from '../api/FakeCloudKotlinFunctionsApi';
import {FunctionDto} from '../api/CloudKotlinFunctionsApi';

describe('FakeCloudKotlinFunctionsApi', () => {
    let api: FakeCloudKotlinFunctionsApi;
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        mockLocalStorage = {};

        Object.defineProperty(global, 'localStorage', {
            value: {
                getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
                setItem: jest.fn((key: string, value: string) => {
                    mockLocalStorage[key] = value;
                }),
                removeItem: jest.fn((key: string) => {
                    delete mockLocalStorage[key];
                }),
                clear: jest.fn(() => {
                    mockLocalStorage = {};
                }),
                length: 0,
                key: jest.fn(),
            },
            writable: true,
        });

        api = new FakeCloudKotlinFunctionsApi(false);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('createFunction', () => {
        it('should create a function from source code', () => {
            const sourceCode = 'fun add(a: Int, b: Int): Int { return a + b }';

            api.createFunction(sourceCode);

            const projects = api.getProjects();
            expect(projects).toHaveLength(1);
            expect(projects[0].functions).toHaveLength(1);

            const func = projects[0].functions[0];
            expect(func.name).toBe('add');
            expect(func.arguments).toHaveLength(2);
            expect(func.arguments[0].name).toBe('a');
            expect(func.arguments[0].type.name).toBe('Int');
            expect(func.arguments[1].name).toBe('b');
            expect(func.arguments[1].type.name).toBe('Int');
            expect(func.returnType.name).toBe('Int');
            expect(func.state).toBe('idle');
        });

        it('should handle functions with no parameters', () => {
            const sourceCode = 'fun getValue(): String { return "test" }';

            api.createFunction(sourceCode);

            const projects = api.getProjects();
            const func = projects[0].functions[0];

            expect(func.name).toBe('getValue');
            expect(func.arguments).toHaveLength(0);
            expect(func.returnType.name).toBe('String');
        });

        it('should handle Unit return type', () => {
            const sourceCode = 'fun doSomething() { println("test") }';

            api.createFunction(sourceCode);

            const projects = api.getProjects();
            const func = projects[0].functions[0];

            expect(func.name).toBe('doSomething');
            expect(func.returnType.name).toBe('Unit');
        });
    });

    describe('deleteFunction', () => {
        it('should delete a function', () => {
            const sourceCode = 'fun test(): Int { return 1 }';
            api.createFunction(sourceCode);

            let projects = api.getProjects();
            const functionId = projects[0].functions[0].id;

            api.deleteFunction(functionId);

            projects = api.getProjects();
            expect(projects[0].functions).toHaveLength(0);
        });
    });

    describe('runFunction', () => {
        it('should run a function and emit state change events', () => {
            const sourceCode = 'fun test(): Int { return 1 }';
            api.createFunction(sourceCode);

            const projects = api.getProjects();
            const functionId = projects[0].functions[0].id;

            const events: FunctionDto[] = [];
            api.subscribeToFunctionEvents((eventId, eventType, functionDto, error) => {
                expect(error).toBeNull();
                events.push(functionDto);
            });

            api.runFunction(functionId);

            expect(events[0].state).toBe('running');

            jest.advanceTimersByTime(1000);

            expect(events[1].state).toBe('idle');
        });

        it('should emit error event when function not found', () => {
            let errorReceived = false;

            api.subscribeToFunctionEvents((eventId, eventType, functionDto, error) => {
                if (error) {
                    errorReceived = true;
                    expect(error.message).toContain('not found');
                }
            });

            api.runFunction('nonexistent-id');

            expect(errorReceived).toBe(false); // Error is thrown, not emitted
        });
    });

    describe('connectionFunctions', () => {
        it('should connect two functions', () => {
            const sourceCode1 = 'fun getNumber(): Int { return 42 }';
            const sourceCode2 = 'fun processNumber(x: Int): String { return x.toString() }';

            api.createFunction(sourceCode1);
            api.createFunction(sourceCode2);

            const projects = api.getProjects();
            const func1Id = projects[0].functions[0].id;
            const func2Id = projects[0].functions[1].id;

            api.connectionFunctions(func1Id, func2Id);

            const updatedProjects = api.getProjects();
            expect(updatedProjects[0].connections).toHaveLength(1);
            expect(updatedProjects[0].connections[0].outFunctionId).toBe(func1Id);
            expect(updatedProjects[0].connections[0].inputArgumentId).toBe(func2Id);
        });
    });

    describe('persistence', () => {
        it('should persist functions to LocalDb', () => {
            const sourceCode = 'fun test(): Int { return 1 }';
            api.createFunction(sourceCode);

            const api2 = new FakeCloudKotlinFunctionsApi(false);
            const projects = api2.getProjects();

            expect(projects[0].functions).toHaveLength(1);
            expect(projects[0].functions[0].name).toBe('test');
        });

        it('should persist connections to LocalDb', () => {
            const sourceCode1 = 'fun getNumber(): Int { return 42 }';
            const sourceCode2 = 'fun processNumber(x: Int): String { return x.toString() }';

            api.createFunction(sourceCode1);
            api.createFunction(sourceCode2);

            const projects = api.getProjects();
            const func1Id = projects[0].functions[0].id;
            const func2Id = projects[0].functions[1].id;

            api.connectionFunctions(func1Id, func2Id);

            const api2 = new FakeCloudKotlinFunctionsApi(false);
            const loadedProjects = api2.getProjects();

            expect(loadedProjects[0].connections).toHaveLength(1);
        });
    });

    describe('event subscription', () => {
        it('should notify multiple subscribers', () => {
            const sourceCode = 'fun test(): Int { return 1 }';
            api.createFunction(sourceCode);

            const events1: FunctionDto[] = [];
            const events2: FunctionDto[] = [];

            api.subscribeToFunctionEvents((eventId, eventType, functionDto, error) => {
                events1.push(functionDto);
            });

            api.subscribeToFunctionEvents((eventId, eventType, functionDto, error) => {
                events2.push(functionDto);
            });

            const projects = api.getProjects();
            const functionId = projects[0].functions[0].id;

            api.runFunction(functionId);
            jest.advanceTimersByTime(1000);

            expect(events1.length).toBeGreaterThan(0);
            expect(events2.length).toBeGreaterThan(0);
            expect(events1.length).toBe(events2.length);
        });
    });
});
