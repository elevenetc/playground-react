import {createSelector} from '@reduxjs/toolkit';
import {RootState} from './store';
import {Function} from '../Function';
import {Edge} from 'reactflow';
import {CallConnectionUtils} from '../callConnectionUtils';
import {namespacesSelectors} from '../namespaces/namespacesSlice';
import {FunctionConnection} from '../FunctionConnection';

export const selectSelectedFunctionId = (state: RootState) => state.ui.selectedFunctionId;
export const selectSelectedNamespaceId = (state: RootState) => state.ui.selectedNamespaceId;
export const selectProjectState = (state: RootState) => state.ui.projectState;
export const selectConnectingInfo = (state: RootState) => state.ui.connectingInfo;

// Aggregate all functions from all namespaces
export const selectAllFunctions = createSelector(
    [namespacesSelectors.selectAll],
    (namespaces): Record<string, Function> => {
        const functionsMap: Record<string, Function> = {};
        namespaces.forEach(namespace => {
            namespace.functions.forEach(func => {
                functionsMap[func.id] = func;
            });
        });
        return functionsMap;
    }
);

// Aggregate all connections from all namespaces
export const selectAllConnections = createSelector(
    [namespacesSelectors.selectAll],
    (namespaces): FunctionConnection[] => {
        const connections: FunctionConnection[] = [];
        namespaces.forEach(namespace => {
            connections.push(...namespace.connections);
        });
        return connections;
    }
);

export const selectFunctionsArray = createSelector(
    [selectAllFunctions],
    (functions): Function[] => Object.values(functions)
);

export const selectSelectedFunction = createSelector(
    [selectAllFunctions, selectSelectedFunctionId],
    (functions, selectedId): Function | null => {
        if (!selectedId) return null;
        return functions[selectedId] || null;
    }
);

export const selectFunctionById = (id: string) =>
    createSelector([selectAllFunctions], (functions): Function | undefined => functions[id]);

// Derive ReactFlow edges from Redux connections
export const selectEdges = createSelector(
    [selectAllConnections],
    (connections): Edge[] => connections.map((conn) => ({
        id: `e-${conn.outFunctionId}-${conn.targetFunctionId}-${conn.targetArgIndex}`,
        source: conn.outFunctionId,
        target: conn.targetFunctionId,
        sourceHandle: CallConnectionUtils.createOutputId(),
        targetHandle: CallConnectionUtils.createInputId(conn.targetArgIndex),
    }))
);

// Helper to find which namespace a function belongs to
export const selectNamespaceIdByFunctionId = (functionId: string) =>
    createSelector(
        [namespacesSelectors.selectAll],
        (namespaces): string | null => {
            const namespace = namespaces.find(ns => ns.functions.some(f => f.id === functionId));
            return namespace?.id || null;
        }
    );
