import {Function} from './Function';
import {FunctionConnection} from './FunctionConnection';
import {CallGroup} from './CallGroup';
import {canRun} from './canRun';

function extractConnectedComponents(
    functions: Function[],
    connections: FunctionConnection[]
): Set<string>[] {
    const parent = new Map<string, string>();

    for (const func of functions) {
        parent.set(func.id, func.id);
    }

    function find(id: string): string {
        if (parent.get(id) !== id) {
            parent.set(id, find(parent.get(id)!));
        }
        return parent.get(id)!;
    }

    function union(a: string, b: string) {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA !== rootB) {
            parent.set(rootA, rootB);
        }
    }

    for (const conn of connections) {
        if (parent.has(conn.outFunctionId) && parent.has(conn.targetFunctionId)) {
            union(conn.outFunctionId, conn.targetFunctionId);
        }
    }

    const components = new Map<string, Set<string>>();
    for (const func of functions) {
        const root = find(func.id);
        if (!components.has(root)) {
            components.set(root, new Set());
        }
        components.get(root)!.add(func.id);
    }

    return Array.from(components.values());
}

function findRootFunctions(
    functionIds: Set<string>,
    connections: FunctionConnection[]
): string[] {
    const inGroupConnections = connections.filter(
        c => functionIds.has(c.outFunctionId) && functionIds.has(c.targetFunctionId)
    );

    const hasIncoming = new Set<string>();
    for (const conn of inGroupConnections) {
        hasIncoming.add(conn.targetFunctionId);
    }

    return Array.from(functionIds).filter(id => !hasIncoming.has(id));
}

function generateGroupId(functionIds: Set<string>): string {
    return Array.from(functionIds).sort().join(':');
}

export function computeCallGroups(
    functions: Function[],
    connections: FunctionConnection[],
    namespaceId: string = ''
): CallGroup[] {
    if (functions.length === 0) return [];

    const components = extractConnectedComponents(functions, connections);
    const functionsMap: Record<string, Function> = {};
    functions.forEach(f => functionsMap[f.id] = f);

    return components.map((functionIds) => {
        const rootFunctionIds = findRootFunctions(functionIds, connections);
        const checkFunctionId = rootFunctionIds[0] ?? Array.from(functionIds)[0];
        const checkFunction = functionsMap[checkFunctionId];
        const canRunResult = canRun(checkFunction, functionsMap, connections);

        return {
            id: generateGroupId(functionIds),
            namespaceId,
            functionIds,
            rootFunctionIds,
            canRun: canRunResult
        };
    });
}
