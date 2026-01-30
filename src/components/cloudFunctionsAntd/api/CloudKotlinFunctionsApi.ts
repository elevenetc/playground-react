import {NamespaceDto} from '../dto/dto';

export interface CloudKotlinFunctionsApi {
    getNamespaces(): NamespaceDto[]

    getCallGroups(namespaceId: string): CallGroupDto[]

    createNamespace(name: string): void

    runFunction(functionId: string): void

    createFunction(namespaceId: string, sourceCode: string): void

    deleteFunction(functionId: string): void

    addConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number): void

    removeConnection(outFunctionId: string, targetFunctionId: string, targetArgIndex: number): void

    subscribeToEvents(callback: EventCallback): () => void
}

export type FunctionEventType = 'created' | 'updated' | 'deleted' | 'state-changed';
export type CallGroupEventType = 'created' | 'updated' | 'deleted';
export type ExecutionLogEventType = 'call-start' | 'function-call-start' | 'function-call-end' | 'call-end';

export type ApiEvent =
    | { kind: 'function'; eventId: string; eventType: FunctionEventType; data: FunctionDto; error: ErrorDto | null }
    | { kind: 'callGroup'; eventId: string; eventType: CallGroupEventType; data: CallGroupDto }
    | { kind: 'executionLog'; eventId: string; eventType: ExecutionLogEventType; data: ExecutionLogDto };

export type EventCallback = (event: ApiEvent) => void;

export type ExecutionLogDto = {
    callGroupId: string;
    runId: string;
    timestamp: string;
    functionId?: string;
    functionName?: string;
    parameters?: Record<string, unknown>;
    returnValue?: unknown;
    error?: string;
};

export type ErrorDto = {
    id: string;
    message: string;
};

export type FunctionDto = {
    name: string;
    id: string;
    returnType: TypeDto;
    arguments: FunctionArgumentDto[];
    sourceCode: string;
    state: string;
    errorMessage?: string;
};

export type FunctionArgumentDto = {
    id: string;
    name: string;
    type: TypeDto;
    nullable: boolean;
    defaultValue: string;
};

export type TypeDto = {
    name: string;
    nullable: boolean;
};

export type ProjectDto = {
    name: string;
    functions: FunctionDto[];
    connections: FunctionConnectionDto[];
};

export type FunctionConnectionDto = {
    outFunctionId: string;
    inputArgumentId: string;
};

export type CallGroupDto = {
    id: string;
    namespaceId: string;
    functionIds: string[];
    rootFunctionIds: string[];
    canRun: CanRunResultDto;
};

export type CanRunResultDto =
    | { can: true }
    | { can: false; reasons: CanRunReasonDto[] };

export type CanRunReasonDto = {
    type: 'not-idle' | 'missing-argument';
    location: 'upstream' | 'current' | 'downstream';
    functionId: string;
    functionName: string;
    state?: string;
    argumentName?: string;
    argumentIndex?: number;
};