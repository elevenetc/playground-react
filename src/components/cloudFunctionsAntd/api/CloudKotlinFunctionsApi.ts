export interface CloudKotlinFunctionsApi {
    getProjects(): ProjectDto[]

    runFunction(functionId: string): void

    createFunction(sourceCode: string): void

    deleteFunction(functionId: string): void

    connectionFunctions(outputFunctionId: string, inputFunctionArgumentId: string): void

    subscribeToFunctionEvents(
        callback: (eventId: string, functionDto: FunctionDto, error: ErrorDto | null) => void
    ): void
}

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