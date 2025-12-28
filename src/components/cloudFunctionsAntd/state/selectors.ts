import {createSelector} from '@reduxjs/toolkit';
import {RootState} from './store';
import {Function} from '../Function';
import {Edge} from 'reactflow';
import {CallConnectionUtils} from '../callConnectionUtils';

export const selectAllFunctions = (state: RootState) => state.project.functions;
export const selectAllConnections = (state: RootState) => state.project.connections;
export const selectSelectedFunctionId = (state: RootState) => state.ui.selectedFunctionId;
export const selectProjectState = (state: RootState) => state.ui.projectState;
export const selectConnectingInfo = (state: RootState) => state.ui.connectingInfo;

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
