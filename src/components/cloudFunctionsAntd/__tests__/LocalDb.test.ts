import {LocalDb} from '../db/LocalDb';
import {FunctionDto, ProjectDto} from '../api/CloudKotlinFunctionsApi';

describe('LocalDb', () => {
    let db: LocalDb;
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
        // Mock localStorage
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

        db = new LocalDb();
    });

    describe('Functions', () => {
        const createTestFunction = (id: string, name: string): FunctionDto => ({
            id,
            name,
            returnType: {name: 'String', nullable: false},
            arguments: [],
            sourceCode: `fun ${name}(): String { return "" }`,
            state: 'idle',
        });

        describe('storeFunction', () => {
            it('should store a new function', () => {
                const func = createTestFunction('1', 'testFunc');
                db.storeFunction(func);

                const functions = db.getFunctions();
                expect(functions).toHaveLength(1);
                expect(functions[0]).toEqual(func);
            });

            it('should update existing function', () => {
                const func = createTestFunction('1', 'testFunc');
                db.storeFunction(func);

                const updatedFunc = {...func, name: 'updatedFunc'};
                db.storeFunction(updatedFunc);

                const functions = db.getFunctions();
                expect(functions).toHaveLength(1);
                expect(functions[0].name).toBe('updatedFunc');
            });

            it('should store multiple functions', () => {
                const func1 = createTestFunction('1', 'func1');
                const func2 = createTestFunction('2', 'func2');

                db.storeFunction(func1);
                db.storeFunction(func2);

                const functions = db.getFunctions();
                expect(functions).toHaveLength(2);
            });
        });

        describe('getFunctions', () => {
            it('should return empty array when no functions stored', () => {
                const functions = db.getFunctions();
                expect(functions).toEqual([]);
            });

            it('should return all stored functions', () => {
                const func1 = createTestFunction('1', 'func1');
                const func2 = createTestFunction('2', 'func2');

                db.storeFunction(func1);
                db.storeFunction(func2);

                const functions = db.getFunctions();
                expect(functions).toHaveLength(2);
                expect(functions).toContainEqual(func1);
                expect(functions).toContainEqual(func2);
            });
        });

        describe('deleteFunction', () => {
            it('should delete a function by id', () => {
                const func1 = createTestFunction('1', 'func1');
                const func2 = createTestFunction('2', 'func2');

                db.storeFunction(func1);
                db.storeFunction(func2);
                db.deleteFunction('1');

                const functions = db.getFunctions();
                expect(functions).toHaveLength(1);
                expect(functions[0].id).toBe('2');
            });

            it('should do nothing if function does not exist', () => {
                const func = createTestFunction('1', 'func1');
                db.storeFunction(func);

                db.deleteFunction('999');

                const functions = db.getFunctions();
                expect(functions).toHaveLength(1);
            });
        });
    });

    describe('Projects', () => {
        const createTestProject = (name: string): ProjectDto => ({
            name,
            functions: [],
            connections: [],
        });

        describe('storeProject', () => {
            it('should store a new project', () => {
                const project = createTestProject('testProject');
                db.storeProject(project);

                const projects = db.getProjects();
                expect(projects).toHaveLength(1);
                expect(projects[0]).toEqual(project);
            });

            it('should update existing project by name', () => {
                const project = createTestProject('testProject');
                db.storeProject(project);

                const updatedProject = {...project, functions: [{id: '1'} as FunctionDto]};
                db.storeProject(updatedProject);

                const projects = db.getProjects();
                expect(projects).toHaveLength(1);
                expect(projects[0].functions).toHaveLength(1);
            });

            it('should store multiple projects', () => {
                const project1 = createTestProject('project1');
                const project2 = createTestProject('project2');

                db.storeProject(project1);
                db.storeProject(project2);

                const projects = db.getProjects();
                expect(projects).toHaveLength(2);
            });
        });

        describe('getProjects', () => {
            it('should return empty array when no projects stored', () => {
                const projects = db.getProjects();
                expect(projects).toEqual([]);
            });

            it('should return all stored projects', () => {
                const project1 = createTestProject('project1');
                const project2 = createTestProject('project2');

                db.storeProject(project1);
                db.storeProject(project2);

                const projects = db.getProjects();
                expect(projects).toHaveLength(2);
                expect(projects).toContainEqual(project1);
                expect(projects).toContainEqual(project2);
            });
        });
    });

    describe('Connections', () => {
        describe('connectFunctions', () => {
            it('should store a new connection', () => {
                db.connectFunctions('func1', 'arg1');

                const connections = db.getConnections();
                expect(connections).toHaveLength(1);
                expect(connections[0]).toEqual({
                    outFunctionId: 'func1',
                    inputArgumentId: 'arg1',
                });
            });

            it('should store multiple connections', () => {
                db.connectFunctions('func1', 'arg1');
                db.connectFunctions('func2', 'arg2');

                const connections = db.getConnections();
                expect(connections).toHaveLength(2);
            });

            it('should allow duplicate connections', () => {
                db.connectFunctions('func1', 'arg1');
                db.connectFunctions('func1', 'arg1');

                const connections = db.getConnections();
                expect(connections).toHaveLength(2);
            });
        });

        describe('getConnections', () => {
            it('should return empty array when no connections stored', () => {
                const connections = db.getConnections();
                expect(connections).toEqual([]);
            });

            it('should return all stored connections', () => {
                db.connectFunctions('func1', 'arg1');
                db.connectFunctions('func2', 'arg2');

                const connections = db.getConnections();
                expect(connections).toHaveLength(2);
            });
        });

        describe('deleteConnection', () => {
            it('should delete a specific connection', () => {
                db.connectFunctions('func1', 'arg1');
                db.connectFunctions('func2', 'arg2');

                db.deleteConnection('func1', 'arg1');

                const connections = db.getConnections();
                expect(connections).toHaveLength(1);
                expect(connections[0]).toEqual({
                    outFunctionId: 'func2',
                    inputArgumentId: 'arg2',
                });
            });

            it('should do nothing if connection does not exist', () => {
                db.connectFunctions('func1', 'arg1');

                db.deleteConnection('func999', 'arg999');

                const connections = db.getConnections();
                expect(connections).toHaveLength(1);
            });

            it('should only delete matching connection', () => {
                db.connectFunctions('func1', 'arg1');
                db.connectFunctions('func1', 'arg2');

                db.deleteConnection('func1', 'arg1');

                const connections = db.getConnections();
                expect(connections).toHaveLength(1);
                expect(connections[0].inputArgumentId).toBe('arg2');
            });
        });
    });

    describe('clear', () => {
        it('should clear all data', () => {
            // Add some data
            db.storeFunction({
                id: '1',
                name: 'func1',
                returnType: {name: 'String', nullable: false},
                arguments: [],
                sourceCode: '',
                state: 'idle',
            });
            db.storeProject({name: 'project1', functions: [], connections: []});
            db.connectFunctions('func1', 'arg1');

            // Clear
            db.clear();

            // Verify all cleared
            expect(db.getFunctions()).toEqual([]);
            expect(db.getProjects()).toEqual([]);
            expect(db.getConnections()).toEqual([]);
        });
    });

    describe('localStorage integration', () => {
        it('should persist data across instances', () => {
            const func = {
                id: '1',
                name: 'testFunc',
                returnType: {name: 'String', nullable: false},
                arguments: [],
                sourceCode: '',
                state: 'idle',
            };

            db.storeFunction(func);

            // Create new instance
            const db2 = new LocalDb();
            const functions = db2.getFunctions();

            expect(functions).toHaveLength(1);
            expect(functions[0]).toEqual(func);
        });

        it('should call localStorage.setItem with correct keys', () => {
            const func = {
                id: '1',
                name: 'testFunc',
                returnType: {name: 'String', nullable: false},
                arguments: [],
                sourceCode: '',
                state: 'idle',
            };

            db.storeFunction(func);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cloudFunctions',
                expect.any(String)
            );
        });

        it('should call localStorage.removeItem when clearing', () => {
            db.clear();

            expect(localStorage.removeItem).toHaveBeenCalledWith('cloudFunctions');
            expect(localStorage.removeItem).toHaveBeenCalledWith('cloudProjects');
            expect(localStorage.removeItem).toHaveBeenCalledWith('functionConnections');
        });
    });
});
