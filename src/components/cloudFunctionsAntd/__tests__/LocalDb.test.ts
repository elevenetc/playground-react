import {LocalDb} from '../db/LocalDb';
import {NamespaceDto} from '../dto/dto';

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

    describe('Namespaces', () => {
        const createTestNamespace = (id: string, name: string): NamespaceDto => ({
            id,
            name,
            createAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            functions: [],
            connections: [],
        });

        describe('storeNamespace', () => {
            it('should store a new namespace', () => {
                const namespace = createTestNamespace('1', 'testNamespace');
                db.storeNamespace(namespace);

                const namespaces = db.getNamespaces();
                expect(namespaces).toHaveLength(1);
                expect(namespaces[0]).toEqual(namespace);
            });

            it('should update existing namespace by id', () => {
                const namespace = createTestNamespace('1', 'testNamespace');
                db.storeNamespace(namespace);

                const updatedNamespace = {
                    ...namespace,
                    functions: [{
                        id: 'f1',
                        name: 'testFunc',
                        returnType: {name: 'String', nullable: false},
                        arguments: [],
                        sourceCode: '',
                        state: 'idle'
                    }]
                };
                db.storeNamespace(updatedNamespace);

                const namespaces = db.getNamespaces();
                expect(namespaces).toHaveLength(1);
                expect(namespaces[0].functions).toHaveLength(1);
            });

            it('should store multiple namespaces', () => {
                const namespace1 = createTestNamespace('1', 'namespace1');
                const namespace2 = createTestNamespace('2', 'namespace2');

                db.storeNamespace(namespace1);
                db.storeNamespace(namespace2);

                const namespaces = db.getNamespaces();
                expect(namespaces).toHaveLength(2);
            });
        });

        describe('getNamespaces', () => {
            it('should return empty array when no namespaces stored', () => {
                const namespaces = db.getNamespaces();
                expect(namespaces).toEqual([]);
            });

            it('should return all stored namespaces', () => {
                const namespace1 = createTestNamespace('1', 'namespace1');
                const namespace2 = createTestNamespace('2', 'namespace2');

                db.storeNamespace(namespace1);
                db.storeNamespace(namespace2);

                const namespaces = db.getNamespaces();
                expect(namespaces).toHaveLength(2);
                expect(namespaces).toContainEqual(namespace1);
                expect(namespaces).toContainEqual(namespace2);
            });
        });
    });

    describe('clear', () => {
        it('should clear all data', () => {
            const namespace: NamespaceDto = {
                id: '1',
                name: 'test',
                createAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                functions: [{
                    id: '1',
                    name: 'func1',
                    returnType: {name: 'String', nullable: false},
                    arguments: [],
                    sourceCode: '',
                    state: 'idle',
                }],
                connections: []
            };

            db.storeNamespace(namespace);
            db.clear();

            expect(db.getNamespaces()).toEqual([]);
        });
    });

    describe('localStorage integration', () => {
        it('should persist data across instances', () => {
            const namespace: NamespaceDto = {
                id: '1',
                name: 'testNamespace',
                createAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                functions: [],
                connections: []
            };

            db.storeNamespace(namespace);

            const db2 = new LocalDb();
            const namespaces = db2.getNamespaces();

            expect(namespaces).toHaveLength(1);
            expect(namespaces[0]).toEqual(namespace);
        });

        it('should call localStorage.setItem with correct keys', () => {
            const namespace: NamespaceDto = {
                id: '1',
                name: 'testNamespace',
                createAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                functions: [],
                connections: []
            };

            db.storeNamespace(namespace);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cloudNamespaces',
                expect.any(String)
            );
        });

        it('should call localStorage.removeItem when clearing', () => {
            db.clear();

            expect(localStorage.removeItem).toHaveBeenCalledWith('cloudNamespaces');
            expect(localStorage.removeItem).toHaveBeenCalledWith('cloudFunctionsInitialized');
        });
    });
});
