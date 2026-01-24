import {CloudKotlinFunctionsApi, ErrorDto, FunctionDto, FunctionEventType, TypeDto} from './CloudKotlinFunctionsApi';
import {LocalDb} from '../db/LocalDb';
import {FakeFunctionRunner} from '../FakeFunctionRunner';
import {Function} from '../Function';
import {FunctionConnection} from '../FunctionConnection';
import {parseKotlinFunction} from './parseKotlinFunction';
import {dtoToFunction} from '../dto/dtoToFunction';
import {NamespaceDto} from "@/components/cloudFunctionsAntd/dto/dto";

export class FakeCloudKotlinFunctionsApi implements CloudKotlinFunctionsApi {
    private localDb: LocalDb;
    private namespaces: Map<string, NamespaceDto>;
    private functions: Map<string, Function>;
    private functionToNamespace: Map<string, string>;
    private connections: FunctionConnection[];
    private runner: FakeFunctionRunner;
    private eventSubscribers: Array<(eventId: string, eventType: FunctionEventType, functionDto: FunctionDto, error: ErrorDto | null) => void>;

    constructor(initializeDemoData: boolean = true) {
        this.localDb = new LocalDb();
        this.namespaces = new Map();
        this.functions = new Map();
        this.functionToNamespace = new Map();
        this.connections = [];
        this.runner = new FakeFunctionRunner(this.functions, this.connections);
        this.eventSubscribers = [];

        this.loadNamespacesFromDb();
        if (initializeDemoData) {
            this.initializeDemoDataIfNeeded();
        }
        this.setupRunnerSubscription();
    }

    getNamespaces(): NamespaceDto[] {
        this.syncCurrentNamespaceToStore();
        return Array.from(this.namespaces.values());
    }

    createNamespace(name: string): void {
        const newNamespace: NamespaceDto = {
            id: crypto.randomUUID(),
            name: name,
            createAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            functions: [],
            connections: []
        };

        this.namespaces.set(newNamespace.id, newNamespace);
        this.saveAllNamespaces();
    }


    runFunction(functionId: string): void {
        try {
            this.runner.run(functionId);
        } catch (error) {
            const func = this.functions.get(functionId);
            if (func) {
                const errorDto: ErrorDto = {
                    id: crypto.randomUUID(),
                    message: error instanceof Error ? error.message : 'Unknown error'
                };

                this.eventSubscribers.forEach(callback => {
                    callback(crypto.randomUUID(), 'state-changed', this.functionToDto(func), errorDto);
                });
            }
        }
    }

    createFunction(namespaceId: string, sourceCode: string): void {
        const namespace = this.namespaces.get(namespaceId);
        if (!namespace) {
            throw new Error(`Namespace ${namespaceId} not found`);
        }

        const functionDto = parseKotlinFunction(sourceCode);
        const func = dtoToFunction(functionDto);

        this.functions.set(func.id, func);
        this.functionToNamespace.set(func.id, namespaceId);

        namespace.functions.push(functionDto);
        namespace.updatedAt = new Date().toISOString();
        this.saveAllNamespaces();

        this.eventSubscribers.forEach(callback => {
            callback(crypto.randomUUID(), 'created', functionDto, null);
        });
    }

    deleteFunction(functionId: string): void {
        const namespaceId = this.functionToNamespace.get(functionId);
        if (namespaceId) {
            const namespace = this.namespaces.get(namespaceId);
            if (namespace) {
                namespace.functions = namespace.functions.filter(f => f.id !== functionId);
                namespace.updatedAt = new Date().toISOString();
            }
        }

        this.functions.delete(functionId);
        this.functionToNamespace.delete(functionId);
        this.connections = this.connections.filter(
            conn => conn.outFunctionId !== functionId && conn.targetFunctionId !== functionId
        );
        this.saveNamespace();

        // Emit deleted event
        const deletedDto: FunctionDto = {
            id: functionId,
            name: '',
            returnType: {name: 'Unit', nullable: false},
            arguments: [],
            sourceCode: '',
            state: 'idle'
        };

        this.eventSubscribers.forEach(callback => {
            callback(crypto.randomUUID(), 'deleted', deletedDto, null);
        });
    }

    addConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number): void {
        if (!this.functions.has(outFunctionId) || !this.functions.has(targetFunctionId)) {
            throw new Error('Both source and target functions must exist');
        }
        const exists = this.connections.some(
            c => c.outFunctionId === outFunctionId
                && c.targetFunctionId === targetFunctionId
                && c.targetArgIndex === targetArgIndex
        );
        if (!exists) {
            this.connections.push(new FunctionConnection(outFunctionId, targetFunctionId, targetArgIndex));
            this.saveNamespace();
        }
    }

    removeConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number): void {
        this.connections = this.connections.filter(
            c => !(c.outFunctionId === outFunctionId
                && c.targetFunctionId === targetFunctionId
                && c.targetArgIndex === targetArgIndex)
        );
        this.saveNamespace();
    }

    subscribeToFunctionEvents(
        callback: (eventId: string, eventType: FunctionEventType, functionDto: FunctionDto, error: ErrorDto | null) => void
    ): void {
        this.eventSubscribers.push(callback);
    }

    private initializeDemoDataIfNeeded(): void {
        if (this.localDb.isInitialized()) {
            return;
        }

        const func1 = 'fun start(): String { return "foo" }';
        const func2 = 'fun validateData(data: String, dataStr: String, dataInt: Int): Boolean { return data.isNotEmpty() }';
        const func3 = 'fun transformData(validationResult: Boolean): List<Int> { return listOf(1, 2, 3) }';

        this.createFunction('default', func1);
        this.createFunction('default', func2);
        this.createFunction('default', func3);

        const allNamespaces = this.getNamespaces();
        if (allNamespaces.length > 0 && allNamespaces[0].functions.length >= 3) {
            const functions = allNamespaces[0].functions;
            this.addConnection(functions[0].id, functions[1].id, 0);
            this.addConnection(functions[1].id, functions[2].id, 0);
        }

        this.localDb.markAsInitialized();
    }

    private loadNamespacesFromDb(): void {
        const namespaces = this.localDb.getNamespaces();

        if (namespaces.length === 0) {
            const defaultNamespace: NamespaceDto = {
                id: 'default',
                name: 'default',
                createAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                functions: [],
                connections: []
            };
            this.namespaces.set(defaultNamespace.id, defaultNamespace);
        } else {
            namespaces.forEach(ns => {
                this.namespaces.set(ns.id, ns);

                ns.functions.forEach(funcDto => {
                    const func = dtoToFunction(funcDto);
                    this.functions.set(func.id, func);
                    this.functionToNamespace.set(func.id, ns.id);
                });

                ns.connections.forEach(connDto => {
                    this.connections.push(new FunctionConnection(connDto.outFunctionId, connDto.inputArgumentId, 0));
                });
            });
        }
    }

    private syncCurrentNamespaceToStore(): void {
        this.namespaces.forEach(namespace => {
            namespace.functions = namespace.functions.map(funcDto => {
                const func = this.functions.get(funcDto.id);
                if (func) {
                    return this.functionToDto(func);
                }
                return funcDto;
            });

            const functionIdsInNamespace = new Set(namespace.functions.map(f => f.id));
            namespace.connections = this.connections
                .filter(c => functionIdsInNamespace.has(c.outFunctionId) && functionIdsInNamespace.has(c.inputArgumentId))
                .map(c => ({
                    outFunctionId: c.outFunctionId,
                    inputArgumentId: c.inputArgumentId
                }));

            namespace.updatedAt = new Date().toISOString();
        });
    }

    private saveAllNamespaces(): void {
        this.syncCurrentNamespaceToStore();
        this.namespaces.forEach(namespace => {
            this.localDb.storeNamespace(namespace);
        });
    }

    private setupRunnerSubscription(): void {
        this.runner.subscribeOnFunctionStateChange(event => {
            const func = this.functions.get(event.functionId);
            if (func) {
                func.state = event.newState;
                const functionDto = this.functionToDto(func);

                this.saveNamespace();

                this.eventSubscribers.forEach(callback => {
                    callback(crypto.randomUUID(), 'state-changed', functionDto, null);
                });
            }
        });
    }

    private saveNamespace(): void {
        this.saveAllNamespaces();
    }

    private functionToDto(func: Function): FunctionDto {
        const args = Array.from(func.arguments.entries());

        return {
            id: func.id,
            name: func.name,
            returnType: this.typeToDto(func.returnType),
            arguments: args.map(([name, type], index) => ({
                id: `${func.id}-arg-${index}`,
                name,
                type: this.typeToDto(type),
                nullable: type.endsWith('?'),
                defaultValue: ''
            })),
            sourceCode: func.sourceCode,
            state: func.state
        };
    }

    private typeToDto(typeString: string): TypeDto {
        const nullable = typeString.endsWith('?');
        const name = nullable ? typeString.slice(0, -1) : typeString;

        return {
            name,
            nullable
        };
    }

}

export const api = new FakeCloudKotlinFunctionsApi();