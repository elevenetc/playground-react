export type ExecutionLogEntry = {
    id: string;
    callGroupId: string;
    runId: string;
    timestamp: Date;
    type: 'call-start' | 'function-call-start' | 'function-call-end' | 'call-end';
    functionId?: string;
    functionName?: string;
    parameters?: Record<string, unknown>;
    returnValue?: unknown;
    error?: string;
};
