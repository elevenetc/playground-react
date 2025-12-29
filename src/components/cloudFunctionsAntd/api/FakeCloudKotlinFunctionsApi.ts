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
    private functions: Map<string, Function>;
    private connections: FunctionConnection[];
    private runner: FakeFunctionRunner;
    private eventSubscribers: Array<(eventId: string, eventType: FunctionEventType, functionDto: FunctionDto, error: ErrorDto | null) => void>;

    constructor(initializeDemoData: boolean = true) {
        this.localDb = new LocalDb();
        this.functions = new Map();
        this.connections = [];
        this.runner = new FakeFunctionRunner(this.functions, this.connections);
        this.eventSubscribers = [];

        if (initializeDemoData) {
            this.initializeDemoDataIfNeeded();
        }
        this.loadNamespaceFromDb();
        this.setupRunnerSubscription();
    }

    getNamespaces(): NamespaceDto[] {
        const allFunctions = Array.from(this.functions.values());

        return [
            {
                id: "default",
                createAt: new Date().toISOString(),
                name: "default",
                updatedAt: new Date().toISOString(),
                functions: allFunctions.map(f => this.functionToDto(f)),
                connections: this.connections.map(c => ({
                    outFunctionId: c.outFunctionId,
                    inputArgumentId: c.inputArgumentId
                }))
            },
        ];
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

    createFunction(sourceCode: string): void {
        const functionDto = parseKotlinFunction(sourceCode);
        const func = dtoToFunction(functionDto);

        this.functions.set(func.id, func);
        this.saveNamespace();

        this.eventSubscribers.forEach(callback => {
            callback(crypto.randomUUID(), 'created', functionDto, null);
        });
    }

    deleteFunction(functionId: string): void {
        this.functions.delete(functionId);
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

    connectionFunctions(outputFunctionId: string, inputFunctionArgumentId: string): void {
        if (!this.functions.has(outputFunctionId) || !this.functions.has(inputFunctionArgumentId)) {
            throw new Error('Both source and target functions must exist');
        }
        this.connections.push(new FunctionConnection(outputFunctionId, inputFunctionArgumentId, 0));
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

        this.createFunction(func1);
        this.createFunction(func2);
        this.createFunction(func3);

        const allNamespaces = this.getNamespaces();
        if (allNamespaces.length > 0 && allNamespaces[0].functions.length >= 3) {
            const functions = allNamespaces[0].functions;
            this.connectionFunctions(functions[0].id, functions[1].id);
            this.connectionFunctions(functions[1].id, functions[2].id);
        }

        this.localDb.markAsInitialized();
    }

    private loadNamespaceFromDb(): void {
        const namespaces = this.localDb.getNamespaces();
        if (namespaces.length > 0) {
            const namespaceDto = namespaces[0];

            namespaceDto.functions.forEach(funcDto => {
                const func = dtoToFunction(funcDto);
                this.functions.set(func.id, func);
            });

            namespaceDto.connections.forEach(connDto => {
                this.connections.push(new FunctionConnection(connDto.outFunctionId, connDto.inputArgumentId, 0));
            });
        }
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
        const namespaces = this.getNamespaces();
        if (namespaces.length > 0) {
            this.localDb.storeNamespace(namespaces[0]);
        }
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