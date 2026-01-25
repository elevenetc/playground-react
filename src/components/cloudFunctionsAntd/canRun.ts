import {Function} from './Function';
import {FunctionConnection} from './FunctionConnection';

export type StreamLocation = 'upstream' | 'current' | 'downstream';

export type CanRunReason =
    | { type: 'not-idle'; location: StreamLocation; functionId: string; functionName: string; state: string }
    | {
    type: 'missing-argument';
    location: StreamLocation;
    functionId: string;
    functionName: string;
    argumentName: string;
    argumentIndex: number
};

export type CanRunResult = {
    can: true;
} | {
    can: false;
    reasons: CanRunReason[];
};

export function canRun(
    func: Function,
    functions: Record<string, Function>,
    connections: FunctionConnection[]
): CanRunResult {
    const reasons: CanRunReason[] = [];
    const visitedUpstream = new Set<string>();
    const visitedDownstream = new Set<string>();

    // Check if the function itself is idle
    if (func.state !== 'idle') {
        reasons.push({
            type: 'not-idle',
            location: 'current',
            functionId: func.id,
            functionName: func.name,
            state: func.state
        });
    }

    // Check if all arguments have connections
    const missingArgs = findMissingArguments(func, connections);
    for (const missing of missingArgs) {
        reasons.push({
            type: 'missing-argument',
            location: 'current',
            functionId: func.id,
            functionName: func.name,
            argumentName: missing.name,
            argumentIndex: missing.index
        });
    }

    // Check upstream functions in the chain
    checkUpstreamFunctions(func.id, functions, connections, visitedUpstream, reasons);

    // Check downstream functions in the chain
    checkDownstreamFunctions(func.id, functions, connections, visitedDownstream, reasons);

    if (reasons.length === 0) {
        return {can: true};
    }

    return {can: false, reasons};
}

function findMissingArguments(
    func: Function,
    connections: FunctionConnection[]
): { name: string; index: number }[] {
    const missing: { name: string; index: number }[] = [];
    const argEntries = Array.from(func.arguments.entries());

    for (let i = 0; i < argEntries.length; i++) {
        const [argName] = argEntries[i];
        const hasConnection = connections.some(
            c => c.targetFunctionId === func.id && c.targetArgIndex === i
        );
        if (!hasConnection) {
            missing.push({name: argName, index: i});
        }
    }

    return missing;
}

function checkUpstreamFunctions(
    functionId: string,
    functions: Record<string, Function>,
    connections: FunctionConnection[],
    visited: Set<string>,
    reasons: CanRunReason[]
): void {
    if (visited.has(functionId)) {
        return;
    }
    visited.add(functionId);

    // Find all connections where this function is the target
    const incomingConnections = connections.filter(c => c.targetFunctionId === functionId);

    for (const conn of incomingConnections) {
        const upstreamFunc = functions[conn.outFunctionId];
        if (!upstreamFunc) {
            continue;
        }

        // Check if upstream function is idle
        if (upstreamFunc.state !== 'idle') {
            reasons.push({
                type: 'not-idle',
                location: 'upstream',
                functionId: upstreamFunc.id,
                functionName: upstreamFunc.name,
                state: upstreamFunc.state
            });
        }

        // Check if upstream function has all its arguments connected
        const missingArgs = findMissingArguments(upstreamFunc, connections);
        for (const missing of missingArgs) {
            reasons.push({
                type: 'missing-argument',
                location: 'upstream',
                functionId: upstreamFunc.id,
                functionName: upstreamFunc.name,
                argumentName: missing.name,
                argumentIndex: missing.index
            });
        }

        // Recursively check further upstream
        checkUpstreamFunctions(upstreamFunc.id, functions, connections, visited, reasons);
    }
}

function checkDownstreamFunctions(
    functionId: string,
    functions: Record<string, Function>,
    connections: FunctionConnection[],
    visited: Set<string>,
    reasons: CanRunReason[]
): void {
    if (visited.has(functionId)) {
        return;
    }
    visited.add(functionId);

    // Find all connections where this function is the source
    const outgoingConnections = connections.filter(c => c.outFunctionId === functionId);

    for (const conn of outgoingConnections) {
        const downstreamFunc = functions[conn.targetFunctionId];
        if (!downstreamFunc) {
            continue;
        }

        // Check if downstream function is idle
        if (downstreamFunc.state !== 'idle') {
            reasons.push({
                type: 'not-idle',
                location: 'downstream',
                functionId: downstreamFunc.id,
                functionName: downstreamFunc.name,
                state: downstreamFunc.state
            });
        }

        // Check if downstream function has all its arguments connected
        const missingArgs = findMissingArguments(downstreamFunc, connections);
        for (const missing of missingArgs) {
            reasons.push({
                type: 'missing-argument',
                location: 'downstream',
                functionId: downstreamFunc.id,
                functionName: downstreamFunc.name,
                argumentName: missing.name,
                argumentIndex: missing.index
            });
        }

        // Recursively check further downstream
        checkDownstreamFunctions(downstreamFunc.id, functions, connections, visited, reasons);
    }
}

function formatLocation(location: StreamLocation): string {
    switch (location) {
        case 'current':
            return 'Function';
        case 'upstream':
            return 'Upstream function';
        case 'downstream':
            return 'Downstream function';
    }
}

export function formatCanRunReasons(reasons: CanRunReason[]): string {
    return reasons.map(reason => {
        const prefix = formatLocation(reason.location);
        switch (reason.type) {
            case 'not-idle':
                return `${prefix} "${reason.functionName}" is ${reason.state}`;
            case 'missing-argument':
                return `${prefix} "${reason.functionName}" has unconnected argument "${reason.argumentName}"`;
        }
    }).join('; ');
}
