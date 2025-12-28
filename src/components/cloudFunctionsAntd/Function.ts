export type FunctionState = 'building' | 'build-error' | 'idle' | 'running';

export type Function = {
    name: string;
    id: string;
    returnType: string;
    arguments: Map<string, string>;
    sourceCode: string;
    state: string;
    errorMessage?: string;
};