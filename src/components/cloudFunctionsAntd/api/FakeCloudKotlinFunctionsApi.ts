import {
    ApiEvent,
    CallGroupDto,
    CloudKotlinFunctionsApi,
    ErrorDto,
    EventCallback,
    FunctionDto,
    TypeDto
} from './CloudKotlinFunctionsApi';
import {LocalDb} from '../db/LocalDb';
import {FakeFunctionRunner} from '../FakeFunctionRunner';
import {Function} from '../Function';
import {FunctionConnection} from '../FunctionConnection';
import {parseKotlinFunction} from './parseKotlinFunction';
import {dtoToFunction} from '../dto/dtoToFunction';
import {NamespaceDto} from '../dto/dto';
import {canRun, CanRunReason, CanRunResult} from '../canRun';

export class FakeCloudKotlinFunctionsApi implements CloudKotlinFunctionsApi {
    private localDb: LocalDb;
    private namespaces: Map<string, NamespaceDto>;
    private functions: Map<string, Function>;
    private functionToNamespace: Map<string, string>;
    private connections: FunctionConnection[];
    private runner: FakeFunctionRunner;
    private eventSubscribers: EventCallback[];
    private callGroups: Map<string, CallGroupDto>;

    constructor(initializeDemoData: boolean = true) {
        this.localDb = new LocalDb();
        this.namespaces = new Map();
        this.functions = new Map();
        this.functionToNamespace = new Map();
        this.connections = [];
        this.runner = new FakeFunctionRunner(this.functions, this.connections);
        this.eventSubscribers = [];
        this.callGroups = new Map();

        this.loadNamespacesFromDb();
        if (initializeDemoData) {
            this.initializeDemoDataIfNeeded();
        }
        this.setupRunnerSubscription();
        this.recomputeAllCallGroups();
    }

    getNamespaces(): NamespaceDto[] {
        this.syncCurrentNamespaceToStore();
        return Array.from(this.namespaces.values());
    }

    getCallGroups(namespaceId: string): CallGroupDto[] {
        return Array.from(this.callGroups.values()).filter(g => g.namespaceId === namespaceId);
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

                this.emitFunctionEvent('state-changed', this.functionToDto(func), errorDto);
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

        this.emitFunctionEvent('created', functionDto, null);
        this.recomputeCallGroupsForNamespace(namespaceId);
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

        const deletedDto: FunctionDto = {
            id: functionId,
            name: '',
            returnType: {name: 'Unit', nullable: false},
            arguments: [],
            sourceCode: '',
            state: 'idle'
        };

        this.emitFunctionEvent('deleted', deletedDto, null);

        if (namespaceId) {
            this.recomputeCallGroupsForNamespace(namespaceId);
        }
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

            const namespaceId = this.functionToNamespace.get(outFunctionId);
            if (namespaceId) {
                this.recomputeCallGroupsForNamespace(namespaceId);
            }
        }
    }

    removeConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number): void {
        const namespaceId = this.functionToNamespace.get(outFunctionId);

        this.connections = this.connections.filter(
            c => !(c.outFunctionId === outFunctionId
                && c.targetFunctionId === targetFunctionId
                && c.targetArgIndex === targetArgIndex)
        );
        this.saveNamespace();

        if (namespaceId) {
            this.recomputeCallGroupsForNamespace(namespaceId);
        }
    }

    subscribeToEvents(callback: EventCallback): void {
        this.eventSubscribers.push(callback);
    }

    private emitFunctionEvent(eventType: 'created' | 'updated' | 'deleted' | 'state-changed', data: FunctionDto, error: ErrorDto | null): void {
        const event: ApiEvent = {
            kind: 'function',
            eventId: crypto.randomUUID(),
            eventType,
            data,
            error
        };
        this.eventSubscribers.forEach(cb => cb(event));
    }

    private emitCallGroupEvent(eventType: 'created' | 'updated' | 'deleted', data: CallGroupDto): void {
        const event: ApiEvent = {
            kind: 'callGroup',
            eventId: crypto.randomUUID(),
            eventType,
            data
        };
        this.eventSubscribers.forEach(cb => cb(event));
    }

    private recomputeAllCallGroups(): void {
        for (const namespaceId of this.namespaces.keys()) {
            this.recomputeCallGroupsForNamespace(namespaceId, false);
        }
    }

    private recomputeCallGroupsForNamespace(namespaceId: string, emitEvents: boolean = true): void {
        const namespace = this.namespaces.get(namespaceId);
        if (!namespace) return;

        const functionIds = new Set(
            Array.from(this.functions.entries())
                .filter(([, f]) => this.functionToNamespace.get(f.id) === namespaceId)
                .map(([id]) => id)
        );

        const relevantConnections = this.connections.filter(
            c => functionIds.has(c.outFunctionId) && functionIds.has(c.targetFunctionId)
        );

        const oldGroupIds = new Set(
            Array.from(this.callGroups.values())
                .filter(g => g.namespaceId === namespaceId)
                .map(g => g.id)
        );

        const components = this.extractConnectedComponents(Array.from(functionIds), relevantConnections);
        const functionsRecord: Record<string, Function> = {};
        this.functions.forEach((f, id) => {
            if (functionIds.has(id)) functionsRecord[id] = f;
        });

        const newGroups: CallGroupDto[] = [];

        for (const component of components) {
            const rootIds = this.findRootFunctions(component, relevantConnections);
            const checkFunctionId = rootIds[0] ?? Array.from(component)[0];
            const checkFunction = functionsRecord[checkFunctionId];
            const canRunResult = canRun(checkFunction, functionsRecord, relevantConnections);

            const groupId = this.generateGroupId(namespaceId, component);
            const group: CallGroupDto = {
                id: groupId,
                namespaceId,
                functionIds: Array.from(component),
                rootFunctionIds: rootIds,
                canRun: this.canRunResultToDto(canRunResult)
            };

            newGroups.push(group);
        }

        const newGroupIds = new Set(newGroups.map(g => g.id));

        // Delete removed groups
        for (const oldId of oldGroupIds) {
            if (!newGroupIds.has(oldId)) {
                const oldGroup = this.callGroups.get(oldId);
                if (oldGroup && emitEvents) {
                    this.emitCallGroupEvent('deleted', oldGroup);
                }
                this.callGroups.delete(oldId);
            }
        }

        // Create or update groups
        for (const newGroup of newGroups) {
            const existed = oldGroupIds.has(newGroup.id);
            this.callGroups.set(newGroup.id, newGroup);

            if (emitEvents) {
                this.emitCallGroupEvent(existed ? 'updated' : 'created', newGroup);
            }
        }
    }

    private extractConnectedComponents(functionIds: string[], connections: FunctionConnection[]): Set<string>[] {
        const parent = new Map<string, string>();
        functionIds.forEach(id => parent.set(id, id));

        const find = (id: string): string => {
            if (parent.get(id) !== id) {
                parent.set(id, find(parent.get(id)!));
            }
            return parent.get(id)!;
        };

        const union = (a: string, b: string) => {
            const rootA = find(a);
            const rootB = find(b);
            if (rootA !== rootB) {
                parent.set(rootA, rootB);
            }
        };

        for (const conn of connections) {
            if (parent.has(conn.outFunctionId) && parent.has(conn.targetFunctionId)) {
                union(conn.outFunctionId, conn.targetFunctionId);
            }
        }

        const components = new Map<string, Set<string>>();
        for (const id of functionIds) {
            const root = find(id);
            if (!components.has(root)) {
                components.set(root, new Set());
            }
            components.get(root)!.add(id);
        }

        return Array.from(components.values());
    }

    private findRootFunctions(functionIds: Set<string>, connections: FunctionConnection[]): string[] {
        const hasIncoming = new Set<string>();
        for (const conn of connections) {
            if (functionIds.has(conn.outFunctionId) && functionIds.has(conn.targetFunctionId)) {
                hasIncoming.add(conn.targetFunctionId);
            }
        }
        return Array.from(functionIds).filter(id => !hasIncoming.has(id));
    }

    private generateGroupId(namespaceId: string, functionIds: Set<string>): string {
        const sortedIds = Array.from(functionIds).sort().join(':');
        return `${namespaceId}::${sortedIds}`;
    }

    private canRunResultToDto(result: CanRunResult): CallGroupDto['canRun'] {
        if (result.can) {
            return {can: true};
        }

        return {
            can: false,
            reasons: result.reasons.map((r: CanRunReason) => ({
                type: r.type,
                location: r.location,
                functionId: r.functionId,
                functionName: r.functionName,
                ...(r.type === 'not-idle' && {state: r.state}),
                ...(r.type === 'missing-argument' && {
                    argumentName: r.argumentName,
                    argumentIndex: r.argumentIndex
                })
            }))
        };
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
                this.emitFunctionEvent('state-changed', functionDto, null);

                // Recompute call groups when function state changes (affects canRun)
                const namespaceId = this.functionToNamespace.get(event.functionId);
                if (namespaceId) {
                    this.recomputeCallGroupsForNamespace(namespaceId);
                }
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
